import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { createPromiseClient } from "@connectrpc/connect";
import {
  createConnectTransport,
  createGrpcWebTransport,
} from "@connectrpc/connect-web";

import { GetEventRequest } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/event/v1/event_service_pb";
import { EventService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/event/v1/event_service_connect";
import { ProviderService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/provider/v1/provider_service_connect";

function App() {
  const [count, setCount] = useState(0);

  const transportWeb = createConnectTransport({
    baseUrl: "http://localhost:8084",
    useBinaryFormat: true,
  });
  const transportGrpc = createGrpcWebTransport({
    baseUrl: "http://localhost:8084",
    useBinaryFormat: true,
  });
  const eventClient = createPromiseClient(EventService, transportGrpc);
  const providerClient = createPromiseClient(ProviderService, transportGrpc);

  const singleEventId = async () => {
    console.log("rpc single");

    eventClient
      .getEvent(GetEventRequest.fromJson({ eventSelector: { id: 218 } }))
      .then((res) => {
        const j = res.toJsonString();
        console.log(j);
      });
  };
  const singleEventKey = async () => {
    console.log("rpc single");
    eventClient
      .getEvent(
        GetEventRequest.fromJson({
          eventSelector: { key: "cadbf65e45491784a4198def5b80dc04" },
        })
      )
      .then((res) => {
        const j = res.toJsonString();
        console.log(j);
      });
  };
  const streamEvent = async () => {
    console.log("rpc stream");
    for await (const res of eventClient.getEvents({})) {
      console.log(res.toJsonString());
    }
  };
  const showProviderList = async () => {
    console.log("show provider list");
    for await (const res of providerClient.listLiveEvents({})) {
      console.log(res.toJsonString());
    }
  };
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => singleEventId()}>do single event (id)</button>
        <button onClick={() => singleEventKey()}>do single event (key)</button>
        <button onClick={() => streamEvent()}>do stream event</button>
        <button onClick={() => showProviderList()}>list provider</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
