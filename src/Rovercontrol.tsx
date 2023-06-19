import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import DrawMaze from './Drawmaze';

interface Log {
  time: string;
  message: string;
}

interface Maze {
  start: [number, number];
  end: [number, number];
  edges: [[number, number], [number, number]][];
  path: [number, number][];
}

const RoverControl: React.FC = () => {

  const [isConnected, setConnected] = useState<boolean>(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [maze, setMaze] = useState<Maze>();
  const [mazeIds, setMazeIds] = useState<string[]>([]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isManualMode, setManualMode] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [websocket, setWebsocket] = useState<WebSocket | undefined>();
  const logEndRef = useRef<HTMLDivElement>(null); 
  
  const serverUrl = 'api.balancebot.site';

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
  useEffect(scrollToBottom, [logs]);

  useEffect(() => {
    // Fetch maze IDs when the component is mounted
    fetch(`https://${serverUrl}/mazehistory/id`)
      .then(response => response.json())
      .then(data => setMazeIds(data))
      .catch(error => console.error(`Could not fetch maze IDs: ${error}`));
  }, []);
  
  useEffect(() => {
    // Fetch previous logs from the server
    fetch(`https://${serverUrl}/logs`)
      .then(response => response.json())
      .then(data => {
        const parsedLogs = data.logs.map((log: any) => ({
          time: log.time,
          message: log.message,
        }));
        console.log('Fetched logs:', parsedLogs);
        setLogs(parsedLogs);
      })
      .catch(error => console.error(error));

    fetch(`https://${serverUrl}/connection_status`)
    .then(response => response.json())
    .then(data => {
      console.log('Fetched connection status:', data.connected);
      setConnected(data.connected);
    })
    .catch(error => console.error(`Could not fetch connection status: ${error}`));

    // Connect to the websocket
    const ws = new WebSocket(`wss://${serverUrl}/ws/frontend`);
      
    // ws.onopen = () => {
      //   setConnected(true);
      // };
      
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "log":
          setLogs(prevLogs => [...prevLogs, {time: data.time, message: data.message}]);
          break;
          case "maze":
            const maze = {
              start: data.start,
              end: data.end,
              edges: data.edges,
              path: data.path,
            };
            setMaze(maze);
            break;
        case "connection_status":
          console.log('Log connection status:', data.connected);
          setConnected(data.connected);
        }
      };
          
    ws.onclose = () => {
      setConnected(false);
    };
            
    setWebsocket(ws);
            
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  
    }, []);

    function handleDropdownChange(event: ChangeEvent<HTMLSelectElement>) {
      const selectedId = event.target.value;
    
      // Send selected ID to server
      if (websocket) {
        websocket.send(JSON.stringify({ type: "maze_id", maze_id: selectedId }));
      }
    }
    
    
    const handleStartStop = (type: 'start' | 'stop') => {
      if (websocket) {
        websocket.send(JSON.stringify({type}));
    }
  };
  
  const handleSendMessage = () => {
    if (websocket) {
      const messageToSend = { type: "message", message: inputMessage };
      websocket.send(JSON.stringify(messageToSend));
      setInputMessage(''); // Clear the input field
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
    
  }, []);
  const reset_logs = async () => {
    try {
      const response = await fetch(`https://${serverUrl}/logs`, {method: 'POST'});
      if (response.ok) {
        setLogs([]); // Clear logs on the frontend only if the server successfully cleared logs
      }
    } catch (error) {
      console.error("Error resetting logs: ", error);
    }
  };


  const formatTime = (date: Date) => {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();
    const s = "0" + date.getSeconds();
    return `${h.slice(-2)}:${m.slice(-2)}:${s.slice(-2)}`;
  };

  

  return (
  <div className="relative bg-white w-screen h-screen">
    <div className="max-w-5xl w-11/12 mx-auto pt-5">
      <h1 className="text-2xl font-bold mb-4 ">BalanceBot</h1>
      <div className={`absolute top-4 right-6 font-bold text-center px-4 py-2 rounded-lg bg-gray-700 
          ${isConnected ? 'text-green-500' : 'text-red-400'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
        <hr className="h-px my-1 bg-gray-200 border-0 dark:bg-gray-400"></hr>
        <p className="text-white font-medium">Time: <span>{formatTime(currentTime)}</span></p>
      </div>
      
      <div className="flex items-center space-x-4 mb-6 ">
        <button onClick={() => reset_logs()} className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">Reset logs</button>
        <button onClick={() => handleStartStop('start')} className="focus:outline-none text-white bg-emerald-500 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 font-medium rounded-lg text-sm px-5 py-2.5">Start</button>
        <button onClick={() => handleStartStop('stop')} className="focus:outline-none text-white bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 font-medium rounded-lg text-sm px-5 py-2.5">Stop</button>

        <label className="relative inline-flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isManualMode}
                onChange={() => setManualMode(!isManualMode)}
              />
              <div className={`block bg-gray-600 w-14 h-8 rounded-full ${isManualMode ? 'bg-blue-800' : 'bg-gray-600'} `}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${isManualMode ? 'translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">Manual</div>
          </label>
      </div>

      {isManualMode && (
        <div>
          <input
            type="text"
            className="rounded px-2 py-1 border-gray-400 border-2 shadow-lg"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-2 rounded ml-2">
            Send Message
          </button>
        </div>
      )}

      <div className="my-6 overflow-y-auto bg-gray-200 h-32 max-w-md border border-gray-400 rounded-lg shadow-lg text-sm font-semibold">
        <ul>
          {logs.map((log, index) => (
            <li key={index} className="border-b border-gray-300 p-2 flex justify-between last:border-b-0">
              <span className="text-left">{log.time} - </span>
              <span className="text-right">{log.message}</span>
            </li>
          ))}
          <div ref={logEndRef} /> 
        </ul>
      </div>

      <div className="max-w-sm">
        <label htmlFor="mazeIds" className="block mb-2 text-sm font-medium text-gray-900">
          Maze history
        </label>
        <select id="mazeIds" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={handleDropdownChange}>
          {mazeIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {maze && <DrawMaze {...maze} />}
      </div>
    </div>
  </div>
  );
};

export default RoverControl;