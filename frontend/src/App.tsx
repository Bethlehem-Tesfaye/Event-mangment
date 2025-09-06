import Loader from "./components/custom/Loader";
import { useFirstLoad } from "./lib/useFirstLoad";
import { Toaster } from "sonner";

function App({ children }: { children: React.ReactNode }) {
  const [loading, finishLoading] = useFirstLoad();

  return (
    <>
      <div>{loading ? <Loader auto onFinish={finishLoading} /> : children}</div>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
