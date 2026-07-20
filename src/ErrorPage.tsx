import { useLocation } from "react-router";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import Heading from "./Heading";
import Layout from "./Layout";

interface ErrorLocationState {
  error?: string;
}

function ErrorPage() {
  const location = useLocation();
  const state = location.state as ErrorLocationState | null;

  return (
    <Layout>
      <Heading text="Sad times :(" href="/" />
      <div className="columns">
        <img
          className="column col-6"
          style={{ height: "100%" }}
          src="/sad_panda.gif"
          alt="A sad panda"
          width={500}
          height={273}
        />
        <pre className="code column col-6" style={{ wordWrap: "break-word" }}>
          <code>{state?.error ?? ""}</code>
        </pre>
      </div>
    </Layout>
  );
}

export default ErrorPage;
