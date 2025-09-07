import { Button } from "@/components/ui/button"
import { Toaster, toast } from "sonner"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Button onClick={() => toast.success("Hello! This is a test toast")}>
        Click me
      </Button>
      <Toaster />
    </div>
  )
}

export default App
