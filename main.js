// main.js

// 요소 선택
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

// Tone.js 악기 설정
const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0.1,
        release: 0.5,
        attackCurve: "exponential"
    },
    volume: 10 // 볼륨 증가
}).toDestination();

const snare = new Tone.NoiseSynth({
    noise: {
        type: "white"
    },
    envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0
    }
}).toDestination();

const hihat = new Tone.MetalSynth({
    frequency: 400,
    envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
}).toDestination();

// 드럼 패턴
const drumPart = new Tone.Part((time, note) => {
    if (Array.isArray(note)) {
        note.forEach(n => {
            if (n === "kick") kick.triggerAttackRelease("C2", "8n", time);
            if (n === "snare") snare.triggerAttackRelease("8n", time);
            if (n === "hihat") hihat.triggerAttackRelease("C6", "16n", time);
        });
    } else {
        if (note === "kick") kick.triggerAttackRelease("C2", "8n", time);
        if (note === "snare") snare.triggerAttackRelease("8n", time);
        if (note === "hihat") hihat.triggerAttackRelease("C6", "16n", time);
    }
}, []); // 패턴을 비워 둠

// 베이스 패턴
const bass = new Tone.MonoSynth({
    oscillator: {
        type: "square"
    },
    filter: {
        Q: 4,
        type: "lowpass",
        rolloff: -24
    },
    envelope: {
        attack: 0.03,
        decay: 0.3,
        sustain: 0.6,
        release: 0.8
    },
    filterEnvelope: {
        attack: 0.03,
        decay: 0.3,
        sustain: 0.7,
        release: 0.8,
        baseFrequency: 50,
        octaves: 2.5,
        exponent: 2
    }
}).toDestination();

const bassPart = new Tone.Part((time, note) => {
    bass.triggerAttackRelease(note.note, note.duration, time);
}, []); // 패턴을 비워 둠

// 특정 마디 수만큼 반복하도록 설정
const numberOfMeasures = 4; // 반복할 마디 수
const measureDuration = Tone.Time("1m").toSeconds(); // 한 마디의 길이 (초)

// 재생 시작 함수
async function startBeat() {
    await Tone.start();
    console.log('Audio Context started');
    Tone.Transport.start();
    
    drumPart.start(0);
    // bassPart.start(0);
    
    // 특정 마디 수만큼 반복 후 멈추기
    setTimeout(() => {
        stopBeat();
    }, measureDuration * numberOfMeasures * 1000); // 반복할 마디 수 * 한 마디의 길이 * 1000 (밀리초 변환)
    
    console.log('Transport started');
}

// 멈춤 함수
function stopBeat() {
    Tone.Transport.stop();
    drumPart.stop();
    // bassPart.stop();
    console.log('Transport stopped');
}

// 재생 시작 버튼 클릭 이벤트
startButton.addEventListener('click', startBeat);

// 멈춤 버튼 클릭 이벤트
stopButton.addEventListener('click', stopBeat);

// 키보드 이벤트 추가
document.addEventListener('keydown', (event) => {
    if (event.key === 'a') {
        startBeat();
    } else if (event.key === 's') {
        stopBeat();
    }
});

// 예시 패턴: 4분음표와 8분음표 섞기
const customPattern = [
    [0, ["kick", "snare"]], [0.5, "hihat"], [1, "snare"], [1.5, "hihat"],
    [2, "kick"], [2.5, "hihat"], [3, "snare"], [3.5, "hihat"]
];

// 커스텀 패턴으로 드럼 패턴 업데이트
drumPart.clear();
customPattern.forEach((note) => {
    drumPart.add(note[0] * Tone.Time("4n"), note[1]);
});

// 베이스 패턴 업데이트
const bassPattern = [
    ["0:0:0", { note: "C2", duration: "4n" }],
    ["0:1:0", { note: "E2", duration: "8n" }],
    ["0:1:2", { note: "G2", duration: "8n" }],
    ["0:2:0", { note: "B1", duration: "4n" }],
    ["0:3:0", { note: "C2", duration: "8n" }],
    ["0:3:2", { note: "E2", duration: "8n" }]
];

bassPart.clear();
bassPattern.forEach((note) => {
    bassPart.add(note[0], note[1]);
});

drumPart.loop = numberOfMeasures; // 반복할 마디 수 설정
bassPart.loop = numberOfMeasures; // 반복할 마디 수 설정
