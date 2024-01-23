import React, {useEffect} from 'react';

export interface HomeProps {
}

export const Home: React.FC<HomeProps> = (props) => {
  const info = `This app is using Chrome (v${window.appApi.chrome()}), Node.js (v${window.appApi.node()}), and Electron (v${window.appApi.electron()})`;


  useEffect(() => {
    window.appApi.receive("app", (event) => {
      console.log("Received event from main ", event);
      alert("Received event from main " + event.action);
    });
  }, [])

  return (
    <div className="App">
      Hello World!
    </div>
  );
}
