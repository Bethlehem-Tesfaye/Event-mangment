import { useState } from "react";
import Loader from "./components/custom/Loader";
import Login from "./pages/Login";


function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div>
       {loading ? (
        <Loader auto onFinish={() => setLoading(false)} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;


