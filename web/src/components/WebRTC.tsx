import { createEffect, createResource } from "solid-js";
import toast from "solid-toast";

export default function WebRTCSetup() {
  const [stream] = createResource(
    { video: true, audio: true },
    openMediaDevices,
  );
  const [videoCamera] = createResource("videoinput", getConnectedDevices);
  let videoElementRef: HTMLVideoElement | undefined;

  createEffect(async () => {
    if (stream.loading) toast.loading("Getting devices", { duration: 1000 });
    if (stream.error)
      toast.error("ERROR getting devices" + stream.error.toString());
    if (!videoElementRef) return;
    if (!stream()) return;
    // @ts-ignore
    if (stream()) videoElementRef.srcObject = stream();
  });

  createEffect(async () => {
    if (videoCamera.loading)
      toast.loading("Enumerating video devices", { duration: 1000 });
    if (videoCamera.error)
      toast.error("ERROR getting devices" + videoCamera.error.toString());

    console.log("cameras found,", videoCamera());
  });

  return (
    <div>
      RTC
      <video
        ref={videoElementRef}
        id="localVideo"
        autoplay
        playsinline
        controls={false}
      />
    </div>
  );
}

const openMediaDevices = async (
  constaints: MediaStreamConstraints,
): Promise<MediaStream> => {
  return await navigator.mediaDevices.getUserMedia(constaints);
};

const getConnectedDevices = async (
  type: MediaDeviceKind,
): Promise<MediaDeviceInfo[]> => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
};
