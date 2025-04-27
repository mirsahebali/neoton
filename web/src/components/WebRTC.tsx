import { createEffect, createResource, createSignal, For } from "solid-js";
import toast from "solid-toast";
import { createEventListener } from "@solid-primitives/event-listener";
import { FaSolidArrowRotateRight } from "solid-icons/fa";

export default function WebRTCSetup() {
  const [videoCameras, { refetch }] = createResource(
    "videoinput",
    getConnectedDevices,
  );

  const [audioInDevices, { refetch: refetchAudioInDevices }] = createResource(
    "audioinput",
    getConnectedDevices,
  );

  const [currCameraId, setCurrCameraId] = createSignal(
    localStorage.getItem("cameraPreferenceID") || "",
  );

  const [videoStream] = createResource(() => {
    return { cameraId: currCameraId(), minHeight: 720, minWidth: 1280 };
  }, openCamera);

  const [videoElementRef, setVideoElementRef] = createSignal<
    HTMLVideoElement | undefined
  >();

  createEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    });

    let dataChannel = peer.createDataChannel("videoCallingChannel");
    dataChannel.send("Hello, Peer");
  });

  createEffect(async () => {
    if (videoStream.loading)
      toast.loading("Loading video stream...", { duration: 1000 });

    if (videoStream.error)
      toast.error(
        "ERROR getting video stream: " + videoStream.error.toString(),
      );
    if (!videoElementRef) return;
    if (!videoStream()) return;
    if (videoStream() && videoStream()!.id.length > 0)
      if (videoElementRef())
        // @ts-ignore
        videoElementRef().srcObject = videoStream();
  });

  createEffect(async () => {
    if (videoCameras.loading)
      toast.loading("Enumerating video devices", { duration: 1000 });
    if (videoCameras.error)
      toast.error("ERROR getting devices" + videoCameras.error.toString());
  });

  createEventListener(navigator.mediaDevices, "devicechange", async () => {
    await refetch();
  });

  return (
    <div>
      RTC
      <div class="resize p-5 overflow-auto border w-fit">
        <video
          ref={setVideoElementRef}
          id="localVideo"
          autoplay
          playsinline
          width={400}
          controls={false}
        />
      </div>
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
        <For each={audioInDevices()} fallback={"No microphone device found"}>
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
      <button
        class={"btn " + (videoCameras.loading ? "animate-spin" : "")}
        onclick={async () => {
          await refetch();
          await refetchAudioInDevices();
        }}
      >
        <FaSolidArrowRotateRight />
      </button>
    </div>
  );
}

export const openMediaDevices = async (
  constaints: MediaStreamConstraints,
): Promise<MediaStream> => {
  return await navigator.mediaDevices.getUserMedia(constaints);
};

const openCamera = async (options: {
  cameraId: string;
  minWidth: number;
  minHeight: number;
}) => {
  const constraints = {
    audio: true,
    video: {
      deviceId: options.cameraId,
      width: { min: options.minWidth },
      height: { min: options.minHeight },
    },
  } as MediaStreamConstraints;

  return await navigator.mediaDevices.getUserMedia(constraints);
};

const getConnectedDevices = async (
  type: MediaDeviceKind,
): Promise<MediaDeviceInfo[]> => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
};
