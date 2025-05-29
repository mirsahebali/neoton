import { createCameras, createMicrophones } from "@solid-primitives/devices";
import { createPermission } from "@solid-primitives/permission";
import { createStream } from "@solid-primitives/stream";
import { createEffect, createSignal, For, JSX } from "solid-js";
import { createStore } from "solid-js/store";
import { copyToClipboard } from "@solid-primitives/clipboard"
import { dbg } from "../utils";
import _ from "lodash";

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      srcObject?: MediaStream;
    }
  }
}

const iceservers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

enum CALL_STATE {
  IDLE,
  INITIATED,
  ACTIVE,
}

export default function Calling(): JSX.Element {
  const microphones = createMicrophones();
  const cameras = createCameras();

  const [selectedCamera, setSelectedCamera] = createSignal(cameras() ? cameras()[0] : undefined)
  const [selectedMicrophone, setSelectedMicrophone] = createSignal(microphones() ? microphones()[0] : undefined)

  const microphonePermission = createPermission("microphone");
  const cameraPermission = createPermission("camera");

  const [foundDevice, setFoundDevice] = createSignal(false);
  const [constraints, setContraints] = createStore<MediaStreamConstraints>({});
  createEffect(() => {
    console.log(selectedCamera());
    console.log(selectedMicrophone());

    const cameraConstraint = { deviceId: selectedCamera()?.deviceId };
    setContraints("video", cameraConstraint);
    setFoundDevice(true);

    const microphoneConstraint = { deviceId: selectedMicrophone()?.deviceId };
    setContraints("audio", microphoneConstraint);
    setFoundDevice(true);
  });

  const [localStream, { mutate, stop }] = createStream(() =>
    foundDevice() ? constraints : undefined,
  );
  const [remoteStream, setRemoteStream] = createSignal<MediaStream>();

  const [CallState, setCallState] = createSignal<CALL_STATE>(CALL_STATE.IDLE);
  const [ICE, setICE] = createSignal("");
  const [input, setInput] = createSignal("");

  let connection = new RTCPeerConnection(iceservers);

  connection.ontrack = event => {
    setRemoteStream(event.streams[0]);
  };

  connection.onicecandidate = () => {
    setICE(JSON.stringify(connection.localDescription));
  };

  createEffect(() => {
    const stream = localStream();
    if (stream === undefined) {
      return;
    }
    console.log(stream);

    stream.getTracks().forEach(track => connection.addTrack(track, stream));
  });

  async function startCall() {
    if (!localStream() || connection.localDescription !== null) {
      return;
    }
    setCallState(CALL_STATE.INITIATED);
    let offer
    try {
      offer = await connection.createOffer();
    } catch (error) {
      console.error(error);
    }
    await connection.setLocalDescription(offer);
  }

  async function answerCall() {
    if (!localStream() || connection.localDescription !== null) {
      return;
    }
    setCallState(CALL_STATE.ACTIVE);
    let remoteOffer = JSON.parse(input());
    connection.setRemoteDescription(remoteOffer);
    let answer
    try {

      answer = await connection.createAnswer();
    } catch (error) {
      console.error(error)

    }
    await connection.setLocalDescription(answer);
  }

  async function addRemote() {
    let remoteAnswer = JSON.parse(input());
    if (connection.remoteDescription === null) {
      try {
        await connection.setRemoteDescription(remoteAnswer);
      } catch (e) {
        console.error(e)
      }
    } else {
      try {

        await connection.addIceCandidate(remoteAnswer);
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function toggleAudio() {
    mutate(s => {
      s?.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      return s;
    });
  }

  async function toggleVideo() {
    mutate(s => {
      s?.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      return s;
    });
  }

  async function endCall() {
    connection.close();
    stop();
    setCallState(CALL_STATE.IDLE);
    setICE("");
    setInput("");
  }

  return (
    <div class="flex items-center flex-col justify-center">
      <div> Camera: {selectedCamera()?.label}</div>
      <select onchange={(e) => {
        const res = _.find(cameras(), (c) => { return c.deviceId === e.target.value });
        setSelectedCamera(res)
      }}>
        <For each={cameras()}>{(c) => <option id={c.deviceId} value={c.deviceId}>{c.label}</option>}</For>
      </select>
      <div> Microphone: {selectedMicrophone()?.label}</div>
      <select onchange={(e) => {
        const res = _.find(microphones(), (c) => { return c.deviceId === e.target.value });
        setSelectedMicrophone(res)
      }}></select>
      <div class="video-container">
        <video class="video border m-1 rounded-xl" prop:srcObject={localStream()} autoplay playsinline muted={true} />
        <video class="video border m-1 rounded-xl" prop:srcObject={remoteStream()} playsinline autoplay />
      </div>
      <input
        type="text"
        class="border rounded-lg bg-black"
        value={input()}
        onChange={e => setInput(e.currentTarget.value)}
      />
      <div class="flex flex-col join join-vertical rounded-lg mt-5">
        <button
          class="btn join-item"
          disabled={localStream() === undefined || CallState() > CALL_STATE.IDLE}
          onClick={startCall}
        >
          Start Call
        </button>
        <button
          class="btn join-item"
          disabled={localStream() === undefined || CallState() > CALL_STATE.IDLE}
          onClick={answerCall}
        >
          Answer Call
        </button>
        <button
          class="btn join-item"
          onClick={addRemote} disabled={CallState() != CALL_STATE.INITIATED}>
          Add Remote
        </button>
        <button
          class="btn join-item"
          onClick={toggleAudio} disabled={microphonePermission() != "granted"}>
          Toggle Audio
        </button>
        <button
          class="btn join-item"
          onClick={toggleVideo} disabled={cameraPermission() != "granted"}>
          Toggle Video
        </button>
        <button

          class="btn join-item"
          onClick={endCall} disabled={CallState() == CALL_STATE.IDLE}>
          End Call
        </button>
      </div>
      <h3>ICE :</h3>
      <p class="text-xs text-wrap p-2 overflow-x-auto overflow-y-auto" use:copyToClipboard>{ICE()}</p>
    </div>
  );
};
