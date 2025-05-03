import { createEffect, createResource, createSignal, For, onCleanup, onMount } from "solid-js";
import toast from "solid-toast";
import { createEventListener } from "@solid-primitives/event-listener";
import { createPermission } from "@solid-primitives/permission"
import { createStream } from "@solid-primitives/stream"
import { FaSolidArrowRotateRight, FaSolidVideo } from "solid-icons/fa";
import { createCameras, createMicrophones } from "@solid-primitives/devices"
import { callSocket, } from "../socket";
import { useGetUser } from "../contexts";
import { CreateCallData, JoinCallData } from "../types";
import { getContacts } from "../requests";
import { BiSolidPhoneCall } from "solid-icons/bi";
import { createStore } from "solid-js/store";
export enum CALL_STATE {
  IDLE,
  INITIATED,
  ACTIVE
}

export default function WebRTCSetup() {

  let { currentUser } = useGetUser()
  let [contacts, { refetch: refetchContacts }] = createResource(getContacts)

  const videoCameras = createCameras()
  const microphones = createMicrophones()

  const microphonePermissions = createPermission("microphone")
  const cameraPermissions = createPermission("camera")

  const [foundDevice, setFoundDevice] = createSignal(false)
  const [constraints, setConstraints] = createStore<MediaStreamConstraints>({})
  const [currCameraId, setCurrCameraId] = createSignal(
    localStorage.getItem("cameraPreferenceID") || "",
  );

  createEffect(() => {
    if (microphones().length > 0) {
      setConstraints("audio", { deviceId: microphones()[0].deviceId })
      setFoundDevice(true)
    }

    if (videoCameras().length > 0) {
      setConstraints("video", { deviceId: currCameraId() })
      setFoundDevice(true)
    }

  })

  const [localStream, { mutate, stop }] = createStream(() => foundDevice() ? constraints : undefined)


  const [remoteStream, setRemoteStream] = createSignal<MediaStream>()

  const [CallState, setCallState] = createSignal<CALL_STATE>(CALL_STATE.IDLE)

  const [ICE, setICE] = createSignal("")
  const [input, setInput] = createSignal("")

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
    ],
  }

  let connection = new RTCPeerConnection(rtcConfig)

  connection.ontrack = event => {
    setRemoteStream(event.streams[0])
  }

  connection.onicecandidate = () => {
    setICE(JSON.stringify(connection.localDescription))
  }


  createEffect(() => {
    const stream = localStream()
    if (!stream) return

    stream.getTracks().forEach(track => connection.addTrack(track, stream))
  })

  const startCall = async (recv_username: string) => {
    if (!localStream() || connection.localDescription !== null) return

    setCallState(CALL_STATE.INITIATED)
    const sessionDescription = await connection.createOffer()
    await connection.setLocalDescription(sessionDescription)

    const inviteData: CreateCallData = {
      sender_username: currentUser.username,
      recv_username,
      sdp: sessionDescription
    };

    callSocket.emit("invite:video", inviteData)
  }

  const answerCall = async () => {
    if (!localStream() || connection.localDescription !== null) return
    setCallState(CALL_STATE.ACTIVE)

    let remoteOffer = JSON.parse(input())
    connection.setRemoteDescription(remoteOffer)
    const answer = await connection.createAnswer()

    await connection.setLocalDescription(answer)
  }

  const addRemote = async () => {
    let remoteAnswer = JSON.parse(input())
    if (connection.remoteDescription === null) {
      await connection.setRemoteDescription(remoteAnswer)
    } else {
      await connection.addIceCandidate(remoteAnswer)
    }
  }

  const toggleAudio = () => {
    mutate(s => {
      s?.getAudioTracks().forEach(track => track.enabled = !track.enabled)
      return s;
    })
  }

  const toggleVideo = () => {
    mutate(s => {
      s?.getVideoTracks().forEach(track => track.enabled = !track.enabled)
      return s
    })
  }

  const endCall = () => {
    connection.close()
    stop()
    setCallState(CALL_STATE.IDLE)
    setICE("")
    setInput("")
  }

  const [localStreamElementRef, setLocalStreamElementRef] = createSignal<
    HTMLVideoElement | undefined
  >();

  const [remoteStreamElementRef, setRemoteStreamElementRef] = createSignal<
    HTMLVideoElement | undefined
  >();
  createEffect(() => {
    const peers = new RTCPeerConnection();

    // let dataChannel = peer.createDataChannel("videoCallingChannel");
    // dataChannel.send("Hello, Peer");
  });

  const [currentRoomId, setRoomId] = createSignal("")
  const [senderUsername, setSenderUsername] = createSignal("")


  createEffect(async () => {
    if (localStream.loading)
      toast.loading("Loading video stream...", { duration: 1000 });

    if (localStream.error)
      toast.error(
        "ERROR getting video stream: " + localStream.error.toString(),
      );
    if (!localStreamElementRef) return;
    if (!localStream()) return;
    if (localStream() && localStream()!.id.length > 0)
      if (localStreamElementRef())
        // @ts-ignore
        localStreamElementRef().srcObject = localStream();
  });


  onCleanup(() => {
    localStream()?.getTracks().forEach(track => track.stop())
  })


  createEffect(() => {


    let eventName = `created:${currentUser.username}`;
    console.log(eventName);
    callSocket.on(eventName, (room_id: string) => {
      console.log(room_id);

      setRoomId(room_id)
    })


    console.log(currentRoomId());
  })


  return (
    <div>
      <h1 class="text-xl font-bold text-center my-3">Calls</h1>
      <div class="resize p-5 overflow-auto border w-fit">
        <video
          ref={setLocalStreamElementRef}
          id="local-steam"
          autoplay
          playsinline
          width={200}
          controls={false}
          muted={true}
        />

        <video
          ref={setRemoteStreamElementRef}
          id="remote-steam"
          autoplay
          playsinline
          width={200}
          controls={false}
        />

      </div>
      <div class="flex flex-col">
        <select
          class="select"
          onchange={(e) => {
            localStorage.setItem("cameraPreferenceID", e.target.value);
            setCurrCameraId(e.target.value);
          }}
        >
          <option disabled selected>
            Pick a camera
          </option>
          <For each={videoCameras()} fallback={"No device found"}>
            {(camera) => {
              return (
                <option
                  class="text-base-content"
                  id={camera.deviceId}
                  selected={currCameraId() === camera.deviceId}
                  value={camera.deviceId}
                >
                  {camera.label}
                </option>
              );
            }}
          </For>
        </select>
        <select name="audio-input" id="audio-input" class="select">
          <option disabled selected>
            Pick a microphone
          </option>
          <For each={microphones()} fallback={"No microphone device found"}>
            {(audio) => {
              return (
                <option
                  class="text-base-content"
                  id={audio.deviceId}
                  value={audio.deviceId}
                >
                  {audio.label}
                </option>
              );
            }}
          </For>
        </select>
      </div>
      <div class="text-center m-5">
        <h1 class="divider text-xl font-semibold">
          Contacts
          <FaSolidArrowRotateRight
            onClick={async () => {
              await refetchContacts();
            }}
            class={
              (contacts.loading ? "animate-spin" : "") +
              "hover:scale-110 duration-300"
            }
          />
        </h1>

        <ul class="list bg-base-100 rounded-box shadow-md">
          <For
            each={currentUser.contacts.filter(
              (contact) => contact.username !== currentUser.username,
            )}
            fallback={
              <div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">
                No Contacts Found
              </div>
            }
          >
            {(contact) => (
              <li class="list-row flex justify-between items-center">
                <div class="text-lg font-semibold">{contact.username}</div>
                <div class="flex gap-4">
                  <button
                    id="video-contact"
                    disabled={localStream() === undefined || CallState() > CALL_STATE.IDLE}
                    onClick={async () => {
                      await startCall(contact.username)
                    }}
                    class="btn btn-circle btn-error text-xl font-bold"
                  >
                    <FaSolidVideo />
                  </button>
                  <button
                    id="voice-contact"
                    class="btn btn-circle btn-error text-xl font-bold"
                  >
                    <BiSolidPhoneCall />
                  </button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>

    </div>
  );
}


export const openMediaDevices = async (
  constaints: MediaStreamConstraints,
): Promise<MediaStream> => {
  return await navigator.mediaDevices.getUserMedia(constaints);
};

export const openCamera = async (options: {
  cameraId: string;
  minWidth: number;
  minHeight: number;
}) => {
  const constraints = {
    audio: true,
    video: { deviceId: options.cameraId, width: 1280, height: 720 },
  } as MediaStreamConstraints;

  return await navigator.mediaDevices.getUserMedia(constraints);
};

export const getConnectedDevices = async (
  type: MediaDeviceKind,
): Promise<MediaDeviceInfo[]> => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
};

