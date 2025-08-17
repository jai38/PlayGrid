// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Confetti from "react-confetti";
// import { Trophy, X, Share2, PartyPopper, RotateCcw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// /**
//  * PlayGrid WinnerBanner
//  * ------------------------------------------------------
//  * A polished, accessible winner banner with confetti, avatar,
//  * share + replay actions, and smooth animations.
//  *
//  * Props
//  * - open: boolean — controls visibility
//  * - winnerName: string
//  * - subtitle?: string (e.g., "Monopoly Champion")
//  * - score?: string | number
//  * - avatarUrl?: string
//  * - onClose?: () => void
//  * - onPlayAgain?: () => void
//  * - onShare?: () => void (fallback shares via Web Share API)
//  * - blurBackground?: boolean (default true)
//  *
//  * Usage
//  * <WinnerBanner
//  *   open={open}
//  *   winnerName="Jai"
//  *   subtitle="Monopoly Champion"
//  *   score={"$12,450"}
//  *   avatarUrl="/avatars/jai.png"
//  *   onPlayAgain={() => startRematch()}
//  *   onClose={() => setOpen(false)}
//  * />
//  */

// export default function WinnerBanner({
//   open,
//   winnerName,
//   subtitle = "Winner!",
//   score,
//   avatarUrl,
//   onClose,
//   onPlayAgain,
//   onShare,
//   blurBackground = true,
// }: {
//   open: boolean;
//   winnerName: string;
//   subtitle?: string;
//   score?: string | number;
//   avatarUrl?: string;
//   onClose?: () => void;
//   onPlayAgain?: () => void;
//   onShare?: () => void;
//   blurBackground?: boolean;
// }) {
//   const [confetti, setConfetti] = useState(open);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setConfetti(open);
//   }, [open]);

//   // Fallback share handler using Web Share API
//   const handleShare = async () => {
//     if (onShare) return onShare();
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: "PlayGrid",
//           text: `${winnerName} just won on PlayGrid! 🎉`,
//           url: typeof window !== "undefined" ? window.location.href : undefined,
//         });
//       } catch (_) {
//         // no-op if user cancels
//       }
//     } else {
//       // Copy to clipboard fallback
//       try {
//         await navigator.clipboard.writeText(
//           `${winnerName} just won on PlayGrid! 🎉\n${
//             typeof window !== "undefined" ? window.location.href : ""
//           }`,
//         );
//         alert("Share link copied to clipboard!");
//       } catch (_) {}
//     }
//   };

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           ref={containerRef}
//           className={`fixed inset-0 z-[80] flex items-center justify-center p-4 ${
//             blurBackground ? "backdrop-blur-sm" : ""
//           }`}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           aria-live="assertive"
//           role="dialog"
//           aria-modal="true">
//           {/* Dim + gradient background */}
//           <div className="absolute inset-0 bg-black/50" aria-hidden />
//           <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.06),transparent_40%)]" />

//           {/* Confetti */}
//           {confetti && (
//             <Confetti
//               numberOfPieces={220}
//               recycle={false}
//               className="pointer-events-none"
//             />
//           )}

//           <motion.div
//             className="relative w-full max-w-xl"
//             initial={{ scale: 0.9, y: 20 }}
//             animate={{ scale: 1, y: 0 }}
//             exit={{ scale: 0.95, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 220, damping: 22 }}>
//             <Card className="relative overflow-hidden rounded-2xl shadow-2xl">
//               {/* Shine */}
//               <div className="pointer-events-none absolute -top-1/2 left-0 h-[200%] w-[200%] -rotate-12 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.1),transparent_30%)]" />

//               <button
//                 onClick={onClose}
//                 className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
//                 aria-label="Close winner banner">
//                 <X className="h-5 w-5" />
//               </button>

//               <CardContent className="relative z-10 p-6 sm:p-8">
//                 <div className="mx-auto flex max-w-md flex-col items-center text-center">
//                   <motion.div
//                     initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
//                     animate={{ rotate: 0, scale: 1, opacity: 1 }}
//                     transition={{
//                       type: "spring",
//                       stiffness: 200,
//                       damping: 12,
//                       delay: 0.05,
//                     }}
//                     className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-200">
//                     <Trophy className="h-4 w-4" />
//                     Champion
//                   </motion.div>

//                   <div className="relative mb-4">
//                     <motion.div
//                       initial={{ scale: 0.8, opacity: 0 }}
//                       animate={{ scale: 1, opacity: 1 }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 240,
//                         damping: 16,
//                         delay: 0.05,
//                       }}
//                       className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-yellow-400/70">
//                       {avatarUrl ? (
//                         <img
//                           src={avatarUrl}
//                           alt={`${winnerName} avatar`}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-300 to-amber-500 text-4xl font-black text-amber-900">
//                           {winnerName?.[0]?.toUpperCase() || "👑"}
//                         </div>
//                       )}
//                     </motion.div>
//                     <motion.div
//                       initial={{ y: 16, opacity: 0 }}
//                       animate={{ y: 0, opacity: 1 }}
//                       transition={{ delay: 0.15 }}
//                       className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80">
//                       <div className="rounded-full bg-black/30 px-2 py-0.5">
//                         MVP
//                       </div>
//                     </motion.div>
//                   </div>

//                   <motion.h2
//                     initial={{ y: 8, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
//                     {winnerName}
//                   </motion.h2>

//                   <motion.p
//                     initial={{ y: 8, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.05 }}
//                     className="mt-1 text-sm text-white/80">
//                     {subtitle}
//                   </motion.p>

//                   {typeof score !== "undefined" && (
//                     <motion.div
//                       initial={{ scale: 0.9, opacity: 0 }}
//                       animate={{ scale: 1, opacity: 1 }}
//                       transition={{ delay: 0.08 }}
//                       className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90">
//                       Final Score:{" "}
//                       <span className="font-semibold">{String(score)}</span>
//                     </motion.div>
//                   )}

//                   <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3">
//                     <Button
//                       onClick={onPlayAgain}
//                       className="rounded-2xl px-5 py-5 text-base font-semibold shadow-lg">
//                       <RotateCcw className="mr-2 h-4 w-4" /> Play Again
//                     </Button>

//                     <Button
//                       onClick={handleShare}
//                       variant="secondary"
//                       className="rounded-2xl px-5 py-5 text-base font-semibold shadow-lg">
//                       <Share2 className="mr-2 h-4 w-4" /> Share
//                     </Button>

//                     <Button
//                       onClick={onClose}
//                       variant="ghost"
//                       className="rounded-2xl px-5 py-5 text-base font-semibold">
//                       <X className="mr-2 h-4 w-4" /> Close
//                     </Button>
//                   </div>

//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.2 }}
//                     className="mt-6 flex items-center gap-2 text-xs text-white/70">
//                     <PartyPopper className="h-4 w-4" />
//                     Tip: Press{" "}
//                     <kbd className="rounded bg-white/20 px-1">Enter</kbd> to
//                     play again
//                   </motion.div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
