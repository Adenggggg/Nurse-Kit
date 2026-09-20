import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Heart, Music2, Moon, Mic, Pause, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nurse Recovery Kit 🩷" }];
}

const PLAYLIST_URL = "https://open.spotify.com/"; // <- swap in your playlist

const FUNNY = [
  "Your feet filed a formal complaint. HR (me) is reviewing it. 🦶",
  "Today you kept humans alive AND survived the vending machine. Iconic.",
  "Breaking news: local nurse is a legend. Details at 11 (after nap).",
  "Vital signs check: 100% cute, 0% patience left. Totally normal.",
];
const COMPLIMENTS = [
  "Ang galing mo talaga. Hindi lahat kayang gawin ang ginagawa mo.",
  "You're someone's best part of a scary day. That's real magic.",
  "Your care is the kind people remember forever.",
  "Strong, kind, and still showing up. Proud of you, nurse!",
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function Home() {
  const [kit, setKit] = useState<{ f: string; c: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  const tap = () => {
    setKit({ f: pick(FUNNY), c: pick(COMPLIMENTS) });
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.35 },
      colors: ["#e8618c", "#ffe1e8", "#fff2bf", "#d5f2e3", "#e4dcff"],
    });
  };

  const toggleVoice = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,var(--color-lilac),transparent_40%),radial-gradient(circle_at_90%_0%,var(--color-butter),transparent_35%)] bg-[#fff8fa] font-sans text-plum">
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 py-10">
      <header className="text-center">
        <div className="text-5xl" aria-hidden>🩺🌷</div>
        <h1 className="font-cute mt-2 text-4xl font-bold">Nurse Recovery Kit</h1>
        <p className="mt-1 text-base opacity-80">Little things for a big-hearted nurse.</p>
      </header>

      {/* Morning voice note */}
      <Card className="flex-row items-center gap-4 rounded-3xl border-0 bg-butter p-4 shadow-[0_6px_0_#f0dc8a]">
        <Button
          size="icon"
          onClick={toggleVoice}
          aria-label={playing ? "Pause voice note" : "Play voice note"}
          className="size-14 shrink-0 rounded-full bg-berry text-white hover:bg-berry/90"
        >
          {playing ? <Pause /> : <Mic />}
        </Button>
        <div>
          <p className="font-cute text-lg font-semibold">Before your shift</p>
          <p className="text-sm opacity-80">Tap to hear a little "Kaya mo yan, nurse!"</p>
        </div>
        <audio ref={audio} src="/kaya-mo-yan.mp3" onEnded={() => setPlaying(false)} />
      </Card>

      {/* Big button */}
      <motion.div whileTap={{ scale: 0.95 }} className="py-2">
        <Button
          onClick={tap}
          className="font-cute h-auto w-full whitespace-normal rounded-full bg-berry px-6 py-5 text-xl font-semibold text-white shadow-[0_8px_0_#b9426a] hover:bg-berry active:translate-y-1 active:shadow-[0_4px_0_#b9426a]"
        >
          <Heart className="mr-2 fill-white" /> Tap when you had a rough shift
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {kit && (
          <motion.div
            key={kit.f + kit.c}
            initial="hide"
            animate="show"
            className="flex flex-col gap-4"
            variants={{ show: { transition: { staggerChildren: 0.18 } } }}
          >
            {[
              { cls: "bg-blush shadow-[0_6px_0_#f3b7c6]", icon: <Sparkles />, tag: "Funny", text: kit.f },
              { cls: "bg-lilac shadow-[0_6px_0_#c7b9f5]", icon: <Heart />, tag: "Compliment", text: kit.c },
              { cls: "bg-mint shadow-[0_6px_0_#a9dcc2]", icon: <Moon />, tag: "Rest", text: "You deserve rest. Water, food, blanket, sleep. The world can wait, nurse. 💤" },
            ].map((c) => (
              <motion.div
                key={c.tag}
                variants={{ hide: { opacity: 0, y: 24, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <Card className={`gap-2 rounded-3xl border-0 p-5 ${c.cls}`}>
                  <Badge className="w-fit gap-1 rounded-full bg-white/70 text-plum hover:bg-white/70">
                    {c.icon} {c.tag}
                  </Badge>
                  <p className="font-cute text-lg leading-snug">{c.text}</p>
                </Card>
              </motion.div>
            ))}

            <motion.div
              variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            >
              <Button asChild variant="outline" className="font-cute h-14 w-full rounded-full border-2 border-plum bg-white text-lg">
                <a href={PLAYLIST_URL} target="_blank" rel="noreferrer">
                  <Music2 className="mr-2" /> Play your decompress playlist
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-auto pt-6 text-center text-sm opacity-60">Made with love, for you. 🩷</p>
    </main>
    </div>
  );
}
