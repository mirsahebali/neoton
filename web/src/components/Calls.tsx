import {
  createEffect,
  createResource,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  ParentProps,
  Setter,
} from "solid-js";
import toast from "solid-toast";
import { createEventListener } from "@solid-primitives/event-listener";
import { createPermission } from "@solid-primitives/permission";
import { createStream } from "@solid-primitives/stream";
import { FaSolidArrowRotateRight, FaSolidVideo } from "solid-icons/fa";
import { createCameras, createMicrophones } from "@solid-primitives/devices";
import { callSocket } from "../socket";
import { useGetUser } from "../contexts";
import { CreateVideoData, InviteVideoData, ResponseVideoData } from "../types";
import { getContacts } from "../requests";
import { BiSolidPhoneCall } from "solid-icons/bi";
import { createStore } from "solid-js/store";
import { ICE_SERVERS } from "../utils";
import { CallingToast } from "./CustomToasts";
export enum CALL_STATE {
  IDLE,
  INITIATED,
  ACTIVE,
}

export default function WebRTCSetup() {
  let currentUserStore = useGetUser();
  let { currentUser, setCurrentUser } = currentUserStore;
  let [contacts, { refetch: refetchContacts }] = createResource(getContacts);

  const microphonePermissions = createPermission("microphone");
  const cameraPermissions = createPermission("camera");

  const videoCameras = createCameras();
  const microphones = createMicrophones();

  createEffect(() => {
    console.log("Microphone permissions", microphonePermissions());
    console.log("Camera Permissions", cameraPermissions());
  });

  const [foundDevice, setFoundDevice] = createSignal(false);
  const [constraints, setConstraints] = createStore<MediaStreamConstraints>({});
  const [currCameraId, setCurrCameraId] = createSignal(
    localStorage.getItem("cameraPreferenceID") || "",
  );

  createEffect(() => {
    console.log(videoCameras());
    console.log(microphones());
    if (microphones().length > 0) {
      setConstraints("audio", { deviceId: microphones()[0].deviceId });
      setFoundDevice(true);
    }
    if (videoCameras().length > 0) {
      setConstraints("video", { deviceId: videoCameras()[0].deviceId });
      setFoundDevice(true);
    }
  });

  const [localStream] = createStream(() =>
    foundDevice() ? constraints : undefined,
  );

  createEffect(() => {
    if (localStream.loading) {
      toast.loading("Loading streams...", { duration: 200 });
    }
    localStreamElementRef()!.srcObject = localStream() as MediaProvider;
  });

  const [remoteStream, setRemoteStream] = createSignal<MediaStream>();

  const [localStreamElementRef, setLocalStreamElementRef] = createSignal<
    HTMLVideoElement | undefined
  >();
  const [remoteStreamElementRef, setRemoteStreamElementRef] = createSignal<
    HTMLVideoElement | undefined
  >();
  const [callModalRef, setCallModalRef] = createSignal();
  const [callingUsername, setCallingUsername] = createSignal("");

  const [CallState, setCallState] = createSignal<CALL_STATE>(CALL_STATE.IDLE);

  const [ICE, setICE] = createSignal("");

  const startCall = async (recv_username: string) => {
    const stream = localStream();
    if (!stream) {
      toast.error("No local stream device found");
      return;
    }

    setCurrentUser("rtcPeerConnection", new RTCPeerConnection(ICE_SERVERS));

    stream
      .getTracks()
      .forEach((track) =>
        currentUser.rtcPeerConnection?.addTrack(track, stream),
      );

    currentUser.rtcPeerConnection!.ontrack = (event) => {
      remoteStreamElementRef()!.srcObject = event.streams[0];
      setRemoteStream(event.streams[0]);
    };

    currentUser.rtcPeerConnection!.onicecandidate = (event) => {
      setICE(JSON.stringify(currentUser.rtcPeerConnection!.localDescription));
      if (event.candidate) {
        callSocket.emit("video:ice_candidate", {
          sender_username: currentUser.username,
          recv_username,
          label: event.candidate.sdpMLineIndex,
          candidate: event.candidate.candidate,
        });
      }
    };

    if (
      !localStream() ||
      currentUser.rtcPeerConnection?.localDescription !== null
    ) {
      console.error("local description not set or local stream not present");
      return;
    }

    setCallState(CALL_STATE.INITIATED);
    let sessionDescription;
    try {
      sessionDescription = await currentUser.rtcPeerConnection.createOffer();
    } catch (e) {
      const err = e as Error;
      toast.error("Error creating offer");
      console.error(err);
      return;
    }

    try {
      await currentUser.rtcPeerConnection!.setLocalDescription(
        sessionDescription,
      );
    } catch (e) {
      const err = e as Error;
      toast.error("Error setting local description");
      console.error(err);
      return;
    }

    const inviteData: CreateVideoData = {
      sender_username: currentUser.username,
      recv_username,
      sdp: sessionDescription,
    };

    callSocket.emit("video:invite", inviteData);
  };

  async function answerCall(
    sessionDescription: RTCLocalSessionDescriptionInit,
  ) { }

  createEffect(() => {
    callSocket.on(
      `video:invite:${currentUser.username}`,
      (data: InviteVideoData) => {
        CallingToast(data.sender_username, currentUserStore, remoteStreamElementRef, setRemoteStream);
      },
    );
  });

  callSocket.on(
    `video:response:${currentUser.username}`,
    async (data: ResponseVideoData) => {
      // reject call and close rtc connection
      if (!data.accepted) {
        currentUser.rtcPeerConnection?.close();
        toast.error(data.recv_username + " declined call");
        setCallState(CALL_STATE.IDLE);
        return;
      }

      toast.success(data.recv_username + " accepted call");
      setCallState(CALL_STATE.IDLE);
    },
  );

  return (
    <div>
      <h1 class="text-xl font-bold text-center my-3">Calls</h1>
      <div class="resize p-5 overflow-auto border w-fit">
        <video
          class="border"
          ref={setLocalStreamElementRef}
          id="local-steam"
          autoplay
          playsinline
          width={200}
          controls={false}
          muted={true}
        />

        <video
          class="border"
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
            setConstraints("video", { deviceId: e.target.value });
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
                    disabled={CallState() !== CALL_STATE.IDLE}
                    onClick={async () => {
                      await startCall(contact.username);
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
      {/* Put this inside another component/function */}
      <div>
        <input
          type="checkbox"
          id="call-modal"
          class="modal-toggle"
          ref={setCallModalRef}
        />
        <div class="modal" role="dialog">
          <div class="modal-box">
            <h3 class="text-lg font-bold">Hello!</h3>
            <p class="py-4">Getting a call from</p>
            <p>{callingUsername()}</p>
            <button
              onclick={async () => {
                setCurrentUser(
                  "rtcPeerConnection",
                  new RTCPeerConnection(ICE_SERVERS),
                );


                currentUser.rtcPeerConnection!.onicecandidate = (event) => {
                  if (event.candidate) {
                    callSocket.emit("video:ice_candidate", {
                      sender_username: callingUsername(),
                      recv_username: currentUser.username,
                      label: event.candidate.sdpMLineIndex,
                      candidate: event.candidate.candidate,
                    });
                  }
                };
                currentUser.rtcPeerConnection!.ontrack = (event) => {
                  remoteStreamElementRef()!.srcObject = event.streams[0];
                  setRemoteStream(event.streams[0])
                };


                let sessionDescription: RTCSessionDescriptionInit;
                try {
                  sessionDescription =
                    await currentUser.rtcPeerConnection!.createAnswer();
                } catch (e) {
                  console.error(e);
                  toast.error("ERROR creating answer");
                  return;
                }
                const data: ResponseVideoData = {
                  recv_username: currentUser.username,
                  sender_username: callingUsername(),
                  accepted: true,
                  sdp: sessionDescription
                };
                callSocket.emit("video:response", data);
              }}
            >
              Accept
            </button>
            <button
              onclick={async () => {
                const data: ResponseVideoData = {
                  recv_username: currentUser.username,
                  sender_username: callingUsername(),
                  accepted: false,
                };
                callSocket.emit("video:response", data);
              }}
            >
              Decline
            </button>
            <div class="modal-action">
              <label for="call-modal" class="btn">
                Close!
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
