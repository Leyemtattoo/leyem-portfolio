"use client";

type IntroProps = {
  onFinish: () => void;
};

export default function Intro({ onFinish }: IntroProps) {
  return (
    <video
      className="fixed inset-0 h-screen w-screen object-cover"
      autoPlay
      muted
      playsInline
      onEnded={onFinish}
    >
      <source src="/Intro.mp4" type="video/mp4" />
    </video>
  );
}
