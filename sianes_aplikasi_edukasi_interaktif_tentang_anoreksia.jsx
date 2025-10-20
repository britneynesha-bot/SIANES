import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// SIANES App (updated) - includes:
// - Background instrumental track ("Lady Killers II" - instrumental) played on open with fade-in/out and mute control.
// - "pop" sound effect on button presses.
// - Bubble animation on answer press.
// NOTE: For the background music file you must place an instrumental MP3 named
// `lady_killers_ii_instrumental.mp3` in your app's public/assets folder or update the URL below.

export default function SIANESApp() {
  const [section, setSection] = useState("home");
  const [bmiData, setBmiData] = useState({ height: "", weight: "", bmi: null, category: "" });
  const [quizState, setQuizState] = useState({ current: 0, score: 0, finished: false, selected: null, feedback: "" });
  const [isMuted, setIsMuted] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  // refs for audio so we can control fade in/out
  const bgAudioRef = useRef(null);
  const popAudioRef = useRef(null);

  useEffect(() => {
    // initialize pop sound
    popAudioRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/soft_pop.ogg");
    popAudioRef.current.volume = 0.6;

    // initialize background music
    // --- IMPORTANT ---
    // Replace the path below with the real hosted instrumental file for "Lady Killers II (Instrumental)".
    // Example: "/assets/lady_killers_ii_instrumental.mp3" if you put it in your public/assets folder.
    const bg = new Audio("/assets/lady_killers_ii_instrumental.mp3");
    bg.loop = true;
    bg.volume = 0; // start silent for fade-in
    bg.preload = "auto";
    bgAudioRef.current = bg;

    // Try to play on load. Browsers may block autoplay until a user gesture.
    const tryPlay = async () => {
      try {
        await bg.play();
        fadeAudio(bg, 0, 0.25, 3000); // fade to 0.25 volume over 3s
        if (isMuted) bg.pause();
      } catch (e) {
        // Autoplay blocked — we'll wait for a user interaction (first button click) to start music.
        // No further action here; music will start when user interacts (we call ensureBgPlaying()).
      }
    };

    tryPlay();

    return () => {
      // cleanup
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
      if (popAudioRef.current) popAudioRef.current = null;
    };
  }, []);

  // fade helper: linear fade
  function fadeAudio(audio, from, to, duration) {
    if (!audio) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // start background music (used when user interacts if autoplay blocked)
  async function ensureBgPlaying() {
    const bg = bgAudioRef.current;
    if (!bg) return;
    if (bg.paused) {
      try {
        await bg.play();
        if (!isMuted) fadeAudio(bg, 0, 0.25, 800);
      } catch (e) {
        // ignore
      }
    }
  }

  // play pop sound + bubble animation
  function playPopAt(x = null, y = null) {
    // play pop
    const pop = popAudioRef.current;
    if (pop && !isMuted) {
      pop.currentTime = 0;
      pop.play().catch(() => {});
    }

    // spawn a bubble (simple: centered, floats up)
    const id = Date.now();
    setBubbles((b) => [...b, { id, x: x || Math.random() * 60 + 20, y: y || 60 }]);
    // remove after animation
    setTimeout(() => setBubbles((b) => b.filter((bb) => bb.id !== id)), 900);

    // ensure bg plays after first user interaction (in case autoplay blocked)
    ensureBgPlaying();
  }

  const quizQuestions = [
    { q: "Apa gejala umum anoreksia? 🌸", options: ["Menghindari makan 🍽️ dan penurunan berat badan drastis", "Peningkatan nafsu makan 😋", "Hanya makan sayur saja 🥦", "Tidak khawatir bentuk tubuh 💃"], a: 0 },
    { q: "Salah satu penyebab psikologis anoreksia adalah 💭", options: ["Pengaruh media & tekanan sosial 📱", "Hanya faktor genetik 🧬", "Konsumsi lemak 🍔", "Kurang tidur 😴"], a: 0 },
    { q: "BMI digunakan untuk ⚖️", options: ["Menilai berat & tinggi proporsional", "Menghitung kalori harian 🍽️", "Menentukan golongan darah 🩸", "Diagnosis medis lengkap 🏥"], a: 0 },
    { q: "Anoreksia berdampak pada apa? 💀", options: ["Organ tubuh dan berat badan 🫀", "Menambah nafsu makan 😋", "Meningkatkan daya ingat 🧠", "Meningkatkan mood 💕"], a: 0 },
    { q: "Apa langkah terbaik untuk mencegah anoreksia? 🌷", options: ["Menerima bentuk tubuh sendiri 💕", "Membandingkan diri dengan orang lain 📱", "Menahan lapar berlebihan 🍽️", "Mengikuti diet ekstrem ❌"], a: 0 }
  ];

  function handleBMICalc(e) {
    e.preventDefault();
    playPopAt();
    const h = parseFloat(bmiData.height);
    const w = parseFloat(bmiData.weight);
    if (!h || !w) return;
    const heightM = h / 100;
    const bmi = +(w / (heightM * heightM)).toFixed(1);
    let cat = "";
    if (bmi < 18.5) cat = "Kurang (Underweight) 🌼";
    else if (bmi < 25) cat = "Normal (Sehat) 💚";
    else if (bmi < 30) cat = "Kelebihan (Overweight) 💛";
    else cat = "Obesitas 💗";
    setBmiData({ ...bmiData, bmi, category: cat });
  }

  function updateBmiField(field, value) {
    playPopAt();
    setBmiData((s) => ({ ...s, [field]: value }));
  }

  function handleAnswer(index) {
    // spawn pop near center
    playPopAt();
    if (quizState.finished) return;
    const cur = quizState.current;
    const correctIndex = quizQuestions[cur].a;
    const correct = correctIndex === index;

    let feedback = "";
    if (correct) feedback = "🔥 Gacorr banget besss!! Jawabanmu mantul abis 💚✨";
    else feedback = `❌ Waduh kamu wrong nii bess 😅 Jawaban yang benar: ${quizQuestions[cur].options[correctIndex]}`;

    setQuizState((prev) => ({ ...prev, selected: index, feedback, score: prev.score + (correct ? 1 : 0) }));

    // move to next after short pause so user can see highlights
    setTimeout(() => {
      setQuizState((prev) => {
        const next = prev.current + 1;
        if (next < quizQuestions.length) {
          return { current: next, score: prev.score, finished: false, selected: null, feedback: "" };
        }
        return { ...prev, finished: true };
      });
    }, 1400);
  }

  function resetQuiz() {
    playPopAt();
    setQuizState({ current: 0, score: 0, finished: false, selected: null, feedback: "" });
  }

  const sections = [
    { id: "home", title: "🏠 Beranda" },
    { id: "pengertian", title: "📘 Pengertian" },
    { id: "penyebab", title: "💡 Penyebab" },
    { id: "gejala", title: "⚠️ Gejala" },
    { id: "pencegahan", title: "🌷 Pencegahan" },
    { id: "penanganan", title: "🤝 Penanganan" },
    { id: "bmi", title: "📏 Kalkulator BMI" },
    { id: "kuis", title: "🧠 Kuis & Penutup" }
  ];

  const content = {
    pengertian: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-3">📘 Pengertian Anoreksia 💖</h2>
        <p>Anoreksia nervosa adalah gangguan makan yang menyebabkan seseorang sangat membatasi asupan makanannya karena takut berat badan naik 💭. Penderita memiliki persepsi tubuh yang keliru dan merasa dirinya gemuk meski sudah kurus sekali 🌸.</p>
      </motion.div>
    ),
    penyebab: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-3">💡 Penyebab Anoreksia 🌷</h2>
        <ul className="list-disc list-inside">
          <li>Tekanan sosial untuk memiliki tubuh ideal 💃</li>
          <li>Masalah psikologis seperti stres atau trauma 💔</li>
          <li>Pengaruh media sosial dan standar kecantikan 💻</li>
          <li>Faktor genetik dan keluarga 🧬</li>
        </ul>
      </motion.div>
    ),
    gejala: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-3">⚠️ Gejala Anoreksia 🌺</h2>
        <ul className="list-disc list-inside">
          <li>Penurunan berat badan drastis ⚖️</li>
          <li>Menolak makan meski lapar 🍽️</li>
          <li>Kelelahan berlebihan 😴</li>
          <li>Gangguan menstruasi pada perempuan 🌼</li>
          <li>Selalu merasa gemuk meski kurus 💭</li>
        </ul>
      </motion.div>
    ),
    pencegahan: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-3">🌷 Pencegahan Anoreksia 💗</h2>
        <p>Meningkatkan kesadaran tentang pentingnya citra tubuh positif 💕, menghindari perbandingan sosial yang tidak sehat, dan mencari dukungan dari teman, keluarga, atau konselor profesional jika merasa tertekan 🌸.</p>
      </motion.div>
    ),
    penanganan: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-3">🤝 Penanganan Anoreksia 💐</h2>
        <p>Penanganan melibatkan terapi psikologis, konseling nutrisi, serta dukungan keluarga dan teman 💬. Dalam kasus berat, pengobatan medis mungkin diperlukan 🏥.</p>
      </motion.div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-blue-50 to-white text-gray-800 p-6">
      <div className="max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-pink-100 relative">
        <header className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-200 to-blue-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💖</div>
            <div>
              <h1 className="text-2xl font-extrabold">SIANES 🌸</h1>
              <p className="text-sm opacity-80">Sistem Informasi ANoreksia Edukatif & Interaktif 💬</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* mute control */}
            <button
              onClick={() => {
                setIsMuted((m) => {
                  const newMuted = !m;
                  const bg = bgAudioRef.current;
                  if (bg) {
                    if (newMuted) {
                      fadeAudio(bg, bg.volume, 0, 400);
                      setTimeout(() => bg.pause(), 420);
                    } else {
                      bg.play().then(() => fadeAudio(bg, 0, 0.25, 600)).catch(() => {});
                    }
                  }
                  return newMuted;
                });
                playPopAt();
              }}
              className="py-2 px-3 rounded-lg text-sm font-medium bg-white/40 hover:bg-white/60"
            >
              {isMuted ? "🔈 Mute" : "🔊 Music On"}
            </button>

            <nav className="hidden md:flex gap-2">
              {sections.map((s) => (
                <button key={s.id} onClick={() => { playPopAt(); setSection(s.id); }} className={`py-2 px-3 rounded-lg text-sm font-medium ${section === s.id ? "bg-white/70 shadow" : "bg-white/30 hover:bg-white/50"}`}>{s.title}</button>
              ))}
            </nav>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 bg-white/60 p-4 rounded-xl shadow-inner">
            <h2 className="font-semibold mb-3">Navigasi 🌼</h2>
            {sections.map((s) => (
              <button key={s.id} onClick={() => { playPopAt(); setSection(s.id); }} className={`text-left p-3 rounded-lg ${section === s.id ? "bg-pink-100 font-semibold" : "hover:bg-blue-50"}`}>{s.title}</button>
            ))}
            <blockquote className="mt-4 text-sm italic text-gray-700">"Kesembuhan dimulai dengan keberanian untuk berbicara dan mencari bantuan. 💕"</blockquote>
          </aside>

          <section className="md:col-span-2 bg-white/60 p-6 rounded-xl">
            {section === "home" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold mb-3">Selamat datang di SIANES 🌺</h2>
                <p>Aplikasi edukatif ini akan membantumu memahami anoreksia dengan cara interaktif dan menyenangkan 🌷✨</p>
                <div className="mt-6 p-4 bg-pink-50 rounded-xl border">💗 Ayo peduli! Dukungan kecil bisa membawa perubahan besar 💪</div>
              </motion.div>
            )}

            {content[section]}

            {section === "bmi" && (
              <article>
                <h2 className="text-xl font-bold mb-3">Kalkulator BMI 📏</h2>
                <form onSubmit={handleBMICalc} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <input type="number" placeholder="Tinggi (cm) 🌸" value={bmiData.height} onChange={(e) => updateBmiField("height", e.target.value)} className="p-3 rounded-lg border" />
                  <input type="number" placeholder="Berat (kg) 💗" value={bmiData.weight} onChange={(e) => updateBmiField("weight", e.target.value)} className="p-3 rounded-lg border" />
                  <button type="submit" className="p-3 rounded-lg bg-pink-300 hover:brightness-95 font-semibold">Hitung 💕</button>
                </form>
                {bmiData.bmi && (<div className="mt-4 p-4 rounded-lg bg-blue-50 border">Hasil: <b>{bmiData.bmi}</b> ({bmiData.category}) 🌸</div>)}
              </article>
            )}

            {section === "kuis" && (
              <article>
                <h2 className="text-xl font-bold mb-3">Kuis & Penutup 🧠💐</h2>
                {!quizState.finished ? (
                  <div>
                    <div>Pertanyaan {quizState.current + 1} dari {quizQuestions.length} 🌻</div>
                    <div className="p-4 bg-pink-50 border rounded-xl relative overflow-hidden">
                      <div className="font-semibold mb-2">{quizQuestions[quizState.current].q}</div>
                      {quizQuestions[quizState.current].options.map((opt, i) => {
                        const isCorrect = quizQuestions[quizState.current].a === i;
                        const isSelected = quizState.selected === i;
                        let btnClass = "block w-full text-left p-2 rounded-lg mb-2 transition-all";

                        if (quizState.selected !== null) {
                          if (isCorrect) btnClass += " bg-green-200 scale-[1.01]";
                          else if (isSelected) btnClass += " bg-red-200 opacity-90";
                          else btnClass += " bg-white";
                        } else {
                          btnClass += " bg-white hover:bg-blue-50";
                        }

                        return (
                          <button key={i} onClick={() => handleAnswer(i)} disabled={quizState.selected !== null} className={btnClass}>{opt}</button>
                        );
                      })}

                      {quizState.feedback && <div className="mt-2 font-semibold text-center">{quizState.feedback}</div>}

                      {/* bubbles */}
                      <div className="pointer-events-none absolute inset-0">
                        {bubbles.map((b) => (
                          <motion.div
                            key={b.id}
                            initial={{ opacity: 1, y: 0, scale: 0.6 }}
                            animate={{ opacity: 0, y: -80, scale: 1 }}
                            transition={{ duration: 0.9 }}
                            style={{ left: `${b.x}%` }}
                            className="absolute bottom-6 w-8 h-8 rounded-full bg-pink-200/80 flex items-center justify-center text-xs"
                          >
                            🫧
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border rounded-xl text-center">
                    🌸 Kuis selesai! Skor kamu: <b>{quizState.score}/{quizQuestions.length}</b> 💕
                    <div className="mt-3">Terima kasih sudah belajar bersama SIANES 💐</div>
                    <div className="mt-3 italic text-pink-600 font-semibold">“Self-love hits different when you finally realize you're the main character 💅🌸💖.” - <b>-Britney</b></div>
                    <button onClick={resetQuiz} className="mt-3 px-3 py-2 rounded-lg bg-pink-200">Ulangi 🔄</button>
                  </div>
                )}
              </article>
            )}
          </section>
        </main>

        <footer className="p-4 bg-white/90 text-center text-sm">🌷 SIANES • Edukasi Anoreksia • Dengan cinta 💗</footer>
      </div>
    </div>
  );
}
