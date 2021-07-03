const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const sharescreen = document.getElementById('share-screen');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true

const peerList = [];
var currentPeer;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
        noiseSuppression: true,
        echoCancellation: true,
    }
}).then(stream => {
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream,)
            currentPeer = call.peerConnection;

        })

    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream,)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream,) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)


}
sharescreen.addEventListener('click', (e) => {
    navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' }, audio: {
            noiseSuppression: true,
            echoCancellation: true,
        }
    }).then(stream => {
        let videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
            stopScreenShare()
        }
        let sender = currentPeer.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind
        })
        sender.replaceTrack(videoTrack)
    })
})

function stopScreenShare() {
    let videoTrack = myVideo.getVideoTracks()[0];
    let senders = currentPeer.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
    })
    senders.replaceTrack(videoTrack);
}