import { useState } from "react";
import Loader from "./components/custom/Loader";

function App({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading ? (
        <Loader auto onFinish={() => setLoading(false)} />
      ) : (
        children
      )}
    </div>
  );
}

export default App;
