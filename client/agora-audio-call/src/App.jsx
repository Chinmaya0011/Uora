import { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { FaPhoneAlt, FaPhoneSlash, FaUser } from "react-icons/fa"; // Import icons from react-icons
import "./App.css"
const appId = "b29d0c64188a4498ae36dedad6737555"; // Replace with your Agora App ID
const apiBaseUrl = "http://localhost:3000/api"; // Your backend API

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function App() {
    const [channelName, setChannelName] = useState("Chinmaya");
    const [joined, setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);

    useEffect(() => {
        // Handle remote user events
        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("New user joined:", user);

            if (mediaType === "audio") {
                console.log("Playing remote user's audio");
                user.audioTrack.play(); // Play remote audio only
            }
        });

        client.on("user-left", (user) => {
            console.log("User left:", user);
        });

        return () => {
            client.removeAllListeners();
        };
    }, []);

    // Join Call
    const joinCall = async () => {
        if (!channelName) {
            alert("Please enter a channel name!");
            return;
        }

        try {
            // Fetch the token from backend
            const response = await axios.get(`${apiBaseUrl}/token?channelName=${channelName}`);
            const { token, uid } = response.data;

            // Join the Agora channel
            await client.join(appId, channelName, token, uid);

            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);

            // Publish local audio but don’t play it locally
            await client.publish([audioTrack]);
            setJoined(true);
            console.log(`Joined channel: ${channelName}`);
        } catch (error) {
            console.error("Error joining call:", error);
            alert("Failed to join call. Check console for details.");
        }
    };

    // Leave Call
    const leaveCall = async () => {
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
        }
        await client.leave();
        setJoined(false);
        console.log("Left the channel");
    };

    return (
        <div className="container">
            <h1>Agora Audio Call</h1>
            <div className="input-container">
                <FaUser className="icon" />
                <input
                    type="text"
                    placeholder="Enter Channel Name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                />
            </div>
            {!joined ? (
                <button className="join-button" onClick={joinCall}>
                    <FaPhoneAlt className="button-icon" /> Join Call
                </button>
            ) : (
                <button className="leave-button" onClick={leaveCall}>
                    <FaPhoneSlash className="button-icon" /> Leave Call
                </button>
            )}
        </div>
    );
}

export default App;