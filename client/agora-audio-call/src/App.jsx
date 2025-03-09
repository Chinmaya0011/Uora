import { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUser } from "react-icons/fa";
import "./App.css";

const appId = "b29d0c64188a4498ae36dedad6737555"; // Your Agora App ID
const apiBaseUrl = "https://uora.onrender.com/api"; // Your backend API URL

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function App() {
    const [channelName, setChannelName] = useState("Chinmaya");
    const [joined, setJoined] = useState(false);
    const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    useEffect(() => {
        const handleUserPublished = async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("New user joined:", user);

            if (mediaType === "video") {
                const remoteVideoContainer = document.getElementById(`remote-video-${user.uid}`);
                if (remoteVideoContainer && !remoteVideoContainer.querySelector("video")) {
                    user.videoTrack.play(`remote-video-${user.uid}`);
                }
            }
            if (mediaType === "audio") {
                user.audioTrack.play();
            }

            setRemoteUsers((prevUsers) => {
                if (!prevUsers.some((u) => u.uid === user.uid)) {
                    return [...prevUsers, user];
                }
                return prevUsers;
            });
        };

        const handleUserLeft = (user) => {
            console.log("User left:", user);
            setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        };

        client.on("user-published", handleUserPublished);
        client.on("user-left", handleUserLeft);

        return () => {
            client.off("user-published", handleUserPublished);
            client.off("user-left", handleUserLeft);
        };
    }, []);

    const joinCall = async () => {
        if (!channelName) {
            alert("Please enter a channel name!");
            return;
        }

        try {
            const response = await axios.get(`${apiBaseUrl}/token?channelName=${channelName}`);
            const { token, uid } = response.data;

            await client.join(appId, channelName, token, uid);

            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setLocalTracks({ audio: audioTrack, video: videoTrack });

            await client.publish([audioTrack, videoTrack]);

            const localVideoContainer = document.getElementById("local-video");
            if (localVideoContainer && !localVideoContainer.querySelector("video")) {
                videoTrack.play("local-video");
            }

            setJoined(true);
            console.log(`Joined channel: ${channelName}`);
        } catch (error) {
            console.error("Error joining call:", error);
            alert("Failed to join call. Check console for details.");
        }
    };

    const leaveCall = async () => {
        if (localTracks.audio) localTracks.audio.close();
        if (localTracks.video) localTracks.video.close();

        remoteUsers.forEach((user) => {
            user.audioTrack?.stop();
            user.videoTrack?.stop();
        });

        await client.leave();
        setJoined(false);
        setRemoteUsers([]);
        setLocalTracks({ audio: null, video: null });
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        console.log("Left the channel");
    };

    const toggleVideo = () => {
        if (localTracks.video) {
            localTracks.video.setEnabled(!isVideoEnabled);
            setIsVideoEnabled((prev) => !prev);
        }
    };

    const toggleAudio = () => {
        if (localTracks.audio) {
            localTracks.audio.setEnabled(!isAudioEnabled);
            setIsAudioEnabled((prev) => !prev);
        }
    };

    return (
        <div className="container">
            <h1>Agora Video Call</h1>
            <div className="input-container">
                <FaUser className="icon" />
                <input
                    type="text"
                    placeholder="Enter Channel Name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                />
            </div>
            <div className="video-container">
                <div id="local-video" className="video-box local-video">Local Video</div>
                {remoteUsers.map((user) => (
                    <div key={user.uid} id={`remote-video-${user.uid}`} className="video-box remote-video">
                        Remote Video - {user.uid}
                    </div>
                ))}
            </div>
            {!joined ? (
                <button className="join-button" onClick={joinCall}>
                    <FaVideo className="button-icon" /> Join Call
                </button>
            ) : (
                <div className="controls">
                    <button className="leave-button" onClick={leaveCall}>
                        <FaVideoSlash className="button-icon" /> Leave Call
                    </button>
                    <button className="toggle-button" onClick={toggleVideo}>
                        {isVideoEnabled ? <FaVideoSlash /> : <FaVideo />} {isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
                    </button>
                    <button className="toggle-button" onClick={toggleAudio}>
                        {isAudioEnabled ? <FaMicrophoneSlash /> : <FaMicrophone />} {isAudioEnabled ? "Mute" : "Unmute"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;