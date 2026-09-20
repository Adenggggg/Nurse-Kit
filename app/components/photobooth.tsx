import { useEffect, useRef, useState } from "react";
import { Camera, Download, RotateCcw, Share2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

const SHOTS = 4;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Photobooth() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "live" | "shooting" | "done">("idle");
  const [count, setCount] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const [flash, setFlash] = useState(false);
  const [strip, setStrip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => stop, []);

  // attach the camera stream once the <video> is on screen
  useEffect(() => {
    if ((state === "live" || state === "shooting") && video.current && stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {});
    }
  }, [state]);

  const open = async () => {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setState("live");
    } catch {
      setError("Can't open the camera. Allow camera access in your browser settings, then try again.");
    }
  };

  const close = () => {
    stop();
    setState("idle");
  };

  // one 4:3 frame from the video, mirrored so it matches the preview
  const grab = () => {
    const v = video.current!;
    const w = 800, h = 600;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    const vw = v.videoWidth, vh = v.videoHeight;
    let sw = vw, sh = (vw * h) / w;
    if (sh > vh) { sh = vh; sw = (vh * w) / h; }
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, w, h);
    return c;
  };

  const compose = (frames: HTMLCanvasElement[]) => {
    const W = 700, pad = 40, pw = W - pad * 2, ph = (pw * 3) / 4, gap = 24, footer = 150;
    const H = pad + SHOTS * ph + (SHOTS - 1) * gap + footer;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#ffe1e8");
    bg.addColorStop(1, "#e4dcff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    frames.forEach((f, i) => {
      const y = pad + i * (ph + gap);
      ctx.fillStyle = "#fff";
      ctx.fillRect(pad - 8, y - 8, pw + 16, ph + 16);
      ctx.drawImage(f, pad, y, pw, ph);
    });
    ctx.textAlign = "center";
    ctx.fillStyle = "#4a2b45";
    ctx.font = "600 44px Fredoka, Nunito, sans-serif";
    ctx.fillText("Nurse Recovery Kit 🩷", W / 2, H - 78);
    ctx.font = "600 26px Nunito, sans-serif";
    ctx.fillText(new Date().toLocaleDateString(undefined, { dateStyle: "long" }), W / 2, H - 36);
    return c.toDataURL("image/png");
  };

  const shoot = async () => {
    setState("shooting");
    const frames: HTMLCanvasElement[] = [];
    for (let i = 1; i <= SHOTS; i++) {
      setShot(i);
      for (let n = 3; n > 0; n--) { setCount(n); await wait(1000); }
      setCount(null);
      frames.push(grab());
      setFlash(true); await wait(150); setFlash(false); await wait(500);
    }
    setStrip(compose(frames));
    stop();
    setState("done");
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = strip!;
    a.download = "nurse-photobooth.png";
    a.click();
  };

  const share = async () => {
    const blob = await (await fetch(strip!)).blob();
    const file = new File([blob], "nurse-photobooth.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Nurse Recovery Kit" }); } catch {}
    } else download();
  };

  return (
    <Card className="gap-3 rounded-3xl border-0 bg-lilac p-5 shadow-[0_6px_0_#c7b9f5]">
      <div className="flex items-center justify-between">
        <h2 className="font-cute text-xl font-semibold">Photobooth</h2>
        {(state === "live" || state === "done") && (
          <Button size="icon" variant="outline" onClick={close} aria-label="Close photobooth" className="size-9 rounded-full">
            <X />
          </Button>
        )}
      </div>

      {state === "idle" && (
        <>
          <p className="text-sm opacity-80">Strike a pose. Four quick shots, one cute photo strip.</p>
          <Button onClick={open} className="font-cute h-12 rounded-full bg-plum text-base text-white hover:bg-plum/90">
            <Camera /> Open photobooth
          </Button>
          {error && <p role="alert" className="text-sm font-semibold text-berry">{error}</p>}
        </>
      )}

      {(state === "live" || state === "shooting") && (
        <>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white bg-plum/10">
            <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" />
            {count && (
              <div className="font-cute absolute inset-0 grid place-items-center text-8xl font-bold text-white [text-shadow:0_4px_0_#e8618c]">
                {count}
              </div>
            )}
            {flash && <div className="absolute inset-0 bg-white" />}
          </div>
          {state === "live" ? (
            <Button onClick={shoot} className="font-cute h-12 rounded-full bg-berry text-base text-white hover:bg-berry/90">
              <Camera /> Take {SHOTS} photos
            </Button>
          ) : (
            <p className="font-cute text-center text-lg">Photo {shot} of {SHOTS}. Smile!</p>
          )}
        </>
      )}

      {state === "done" && strip && (
        <>
          <img src={strip} alt="Your photo strip" className="mx-auto max-h-[70vh] w-auto rounded-2xl border-4 border-white" />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={share} className="font-cute h-12 rounded-full bg-berry text-white hover:bg-berry/90">
              <Share2 /> Share
            </Button>
            <Button onClick={download} variant="outline" className="font-cute h-12 rounded-full border-2 border-plum">
              <Download /> Save
            </Button>
          </div>
          <Button onClick={open} variant="outline" className="font-cute h-11 rounded-full bg-white/70">
            <RotateCcw /> Retake
          </Button>
        </>
      )}
    </Card>
  );
}
