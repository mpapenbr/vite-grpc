import React, { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { createCallbackClient, createPromiseClient } from "@connectrpc/connect";
import {
  createConnectTransport,
  createGrpcWebTransport,
} from "@connectrpc/connect-web";

import {
  AnalysisComponent,
  LiveAnalysisSelRequest,
  LiveRaceStateRequest,
} from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/livedata/v1/live_service_pb";
import { ProviderService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/provider/v1/provider_service_connect";

import { LiveAnalysisSelResponse } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/livedata/v1/live_service_pb";
import { ProviderServiceClient } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/provider/v1/provider_service_pb.client";
import { LiveDataService } from "@buf/mpapenbr_testrepo.connectrpc_es/testrepo/livedata/v1/live_service_connect";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
function App() {
  const [count, setCount] = useState(0);

  const transportWeb = createConnectTransport({
    baseUrl: "http://localhost:8084",
    useBinaryFormat: true,
  });
  const transportGrpc = createGrpcWebTransport({
    baseUrl: "http://localhost:8084",
  });

  let grpcWebTransport = new GrpcWebFetchTransport({
    baseUrl: "http://localhost:8084",
    format: "binary",
  });

  const livedataClient = createCallbackClient(LiveDataService, transportGrpc);
  const providerClient = new ProviderServiceClient(grpcWebTransport);
  const providerClientConnect = createPromiseClient(
    ProviderService,
    transportGrpc
  );
  // const livedataClient = createCallbackClient(LiveDataService, transportGrpc);

  const singleEventId = async () => {
    console.log("rpc single");
  };
  const singleEventKey = async () => {
    console.log("rpc single");
  };
  const streamEvent = async () => {
    console.log("rpc stream");
  };
  const showProviderList = async () => {
    console.log("show provider list");
    let { events } = await providerClient.listLiveEvents({}).response;
    console.log(events);

    {
      const { events } = await providerClientConnect.listLiveEvents({});
      for (const event of events) {
        console.log(event.event);
      }
    }
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
        const x: LiveAnalysisSelResponse = res;

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
