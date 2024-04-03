import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { createPromiseClient, createCallbackClient } from "@connectrpc/connect";
import {
  createConnectTransport,
  createGrpcWebTransport,
} from "@connectrpc/connect-web";

import { GetEventRequest } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/event/v1/event_service_pb";
import { EventService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/event/v1/event_service_connect";
import {
  AnalysisComponent,
  LiveAnalysisSelRequest,
  LiveRaceStateRequest,
} from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/livedata/v1/live_service_pb";
import { ProviderService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/provider/v1/provider_service_connect";
import { LiveDataService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/livedata/v1/live_service_connect";

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
  const livedataClient = createCallbackClient(LiveDataService, transportGrpc);

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
      res.console.log(res.toJsonString());
    }
  };
  const showProviderList = async () => {
    console.log("show provider list");
    const events = await providerClient.listLiveEvents({});
    console.log(events.toJsonString());
  };

  var liveAnalysisCancel;
  var liveStateCancel;
  const startLiveData = () => {
    var analysisCount = 0;
    var stateCount = 0;
    liveAnalysisCancel = livedataClient.liveAnalysisSel(
      LiveAnalysisSelRequest.fromJson({
        event: { key: "test" },
        selector: {
          components: [AnalysisComponent.CAR_INFOS],
        },
      }),
      (res) => {
        console.log(
          `analysis msg: ${analysisCount}: ${res.toJsonString().length}`
        );
        analysisCount++;
      },
      (err) => {
        if (err != undefined) console.log(err);
      }
    );
    liveStateCancel = livedataClient.liveRaceState(
      LiveRaceStateRequest.fromJson({
        event: { key: "test" },
      }),
      (res) => {
        console.log(`state msg: ${stateCount}: ${res.toJsonString().length}`);
        stateCount++;
      },
      (err) => {
        if (err != undefined) console.log(err);
      }
    );
  };

  const stopLiveData = () => {
    if (liveAnalysisCancel != undefined) {
      liveAnalysisCancel();
      liveStateCancel();
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
        <button onClick={() => startLiveData()}>Start live data</button>

        <button onClick={() => stopLiveData()}>Stop live data</button>
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
