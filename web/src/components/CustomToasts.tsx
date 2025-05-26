import { createEffect, createSignal, onCleanup, Setter } from "solid-js";
import toast from "solid-toast";
import { acceptInvite, ICE_SERVERS, refetchSetUserStore } from "../utils";
import { CurrentUserStore, ResponseVideoData, UserInfo } from "../types";
import { callSocket } from "../socket";

export function InvitationToast(
  senderUsername: string,
  currentUserStoreContext: CurrentUserStore,
) {
  const {
    currentUser,
    setCurrentUser,
    refetchContacts,
    mutateContacts,
    refetchInvites,
    mutateInvites,
    refetchRequests,
    mutateRequests: _mutateRequests,
  } = currentUserStoreContext;

  // Toast with a countdown timer
  const duration = 7000;
  toast.custom(
    (t) => {
      // Start with 100% life
      const [life, setLife] = createSignal(100);
      const startTime = Date.now();
      createEffect(() => {
        if (t.paused) return;
        const interval = setInterval(() => {
          const diff = Date.now() - startTime - t.pauseDuration;
          setLife(100 - (diff / duration) * 100);
        });

        onCleanup(() => clearInterval(interval));
      });

      return (
        <div
          class={`${t.visible ? "animate-enter" : "animate-leave"} bg-cyan-600 p-3 rounded-md shadow-md min-w-[350px]`}
        >
          <div class="flex gap-2 flex-col">
            <div class="flex flex-col">
              <div class="font-medium text-white">
                Invitation from {senderUsername}
              </div>
              <div class="text-sm text-cyan-50">Do you want to accept?</div>
            </div>
            <div class="flex items-center gap-8">
              <button
                class="btn btn-info"
                onClick={async () => {
                  acceptInvite(senderUsername, currentUser);
                  let dummyContact: UserInfo = {
                    email: "",
                    username: senderUsername,
                    id: NaN,
                  };
                  mutateInvites((invites: UserInfo[]) =>
                    invites.filter((ivt) => ivt.username != senderUsername),
                  );

                  mutateContacts((contacts: UserInfo[]) => [
                    ...contacts,
                    dummyContact,
                  ]);

                  await refetchSetUserStore(
                    setCurrentUser,
                    refetchContacts,
                    refetchInvites,
                    refetchRequests,
                  );
                  toast.dismiss(t.id);
                }}
              >
                Accept
              </button>
              <button
                class="btn btn-error"
                onClick={async () => {
                  toast.dismiss(t.id);
                  await refetchInvites();
                }}
              >
                Ignore
              </button>
            </div>
          </div>
          <div class="relative pt-4">
            <div class="w-full h-1 rounded-full bg-cyan-900"></div>
            <div
              class="h-1 top-4 absolute rounded-full bg-cyan-50"
              style={{ width: `${life()}%` }}
            ></div>
          </div>
        </div>
      );
    },
    {
      duration: duration,
    },
  );
}

export function CallingToast(
  senderUsername: string,
  currentUserStoreContext: CurrentUserStore,
  remoteStreamElementRef: () => HTMLVideoElement | undefined,
  setRemoteStream: Setter<MediaStream | undefined>
) {
  const { currentUser, setCurrentUser } = currentUserStoreContext;

  // Toast with a countdown timer
  const duration = 60000; // 60 secs
  toast.custom(
    (t) => {
      // Start with 100% life
      const [life, setLife] = createSignal(100);
      const startTime = Date.now();
      createEffect(() => {
        if (t.paused) return;
        const interval = setInterval(() => {
          const diff = Date.now() - startTime - t.pauseDuration;
          setLife(100 - (diff / duration) * 100);
        });

        onCleanup(() => clearInterval(interval));
      });

      return (
        <div
          class={`${t.visible ? "animate-enter" : "animate-leave"} bg-cyan-600 p-3 rounded-md shadow-md min-w-[350px]`}
        >
          <div class="flex gap-2 flex-col">
            <div class="flex flex-col">
              <div class="font-medium text-white">
                Call from {senderUsername}
              </div>
            </div>
            <div class="flex items-center gap-8">
              <button
                id="accept-video-call"
                class="btn btn-info"
                onClick={async () => {
                  async () => {
                    setCurrentUser(
                      "rtcPeerConnection",
                      new RTCPeerConnection(ICE_SERVERS),
                    );


                    currentUser.rtcPeerConnection!.onicecandidate = (event) => {
                      if (event.candidate) {
                        callSocket.emit("video:ice_candidate", {
                          sender_username: senderUsername,
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
                      sender_username: senderUsername,
                      accepted: true,
                      sdp: sessionDescription
                    };
                    callSocket.emit("video:response", data);
                  }
                }}
              >
                Accept
              </button>
              <button
                id="decline-video-call"
                class="btn btn-error"
                onClick={async () => {
                  const data: ResponseVideoData = {
                    recv_username: currentUser.username,
                    sender_username: senderUsername,
                    accepted: false,
                  };
                  callSocket.emit("video:response", data);
                  toast.dismiss(t.id);
                }}
              >
                Decline
              </button>
            </div>
          </div>
          <div class="relative pt-4">
            <div class="w-full h-1 rounded-full bg-cyan-900"></div>
            <div
              class="h-1 top-4 absolute rounded-full bg-cyan-50"
              style={{ width: `${life()}%` }}
            ></div>
          </div>
        </div>
      );
    },
    {
      duration: duration,
    },
  );
}
