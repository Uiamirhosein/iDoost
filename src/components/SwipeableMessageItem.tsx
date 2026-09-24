import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Reply, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import { triggerHaptic } from '../lib/telegram';

interface SwipeableMessageItemProps {
  msg: ChatMessage;
  partnerName: string;
  onReply: (msg: ChatMessage) => void;
}

export const SwipeableMessageItem: React.FC<SwipeableMessageItemProps> = ({
  msg,
  partnerName,
  onReply,
}) => {
  const isMe = msg.senderId === 'me';
  const x = useMotionValue(0);

  // When dragging left (x goes from 0 to -65), animate the reply icon on the right side
  const iconOpacity = useTransform(x, [0, -25, -60], [0, 0.5, 1]);
  const iconScale = useTransform(x, [0, -35, -65], [0.5, 0.9, 1.2]);
  const iconX = useTransform(x, [0, -65], [10, 0]);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -45) {
      triggerHaptic('light');
      onReply(msg);
    }
  };

  return (
    <div className={`flex flex-col relative w-full ${isMe ? 'items-start' : 'items-end'}`}>
      <div className="relative max-w-[85%] flex items-center">
        {/* Reply Icon revealed on the RIGHT side of the bubble when swiped left in RTL */}
        <motion.div
          style={{
            opacity: iconOpacity,
            scale: iconScale,
            x: iconX,
          }}
          className="absolute -right-8 flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 pointer-events-none z-0"
        >
          <Reply className="w-3.5 h-3.5 -scale-x-100" />
        </motion.div>

        {/* Swipeable Message Bubble with auto-spring reset (dragSnapToOrigin) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -75, right: 0 }}
          dragSnapToOrigin={true}
          dragElastic={0.25}
          style={{ x }}
          onDragEnd={handleDragEnd}
          className={`w-full rounded-[20px] px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative z-10 cursor-grab active:cursor-grabbing select-none ${
            isMe
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
              : 'bg-[#181926] text-white/90 border border-white/[0.08] rounded-bl-none'
          }`}
        >
          {/* Quoted Reply Header if this message replies to an older one */}
          {msg.replyTo && (
            <div
              className={`mb-1.5 p-2 rounded-xl text-[11px] border-r-2 text-right ${
                isMe
                  ? 'bg-black/20 border-white/80 text-white/90'
                  : 'bg-white/5 border-purple-400 text-white/80'
              }`}
            >
              <span className="font-bold text-[10px] text-purple-200 block mb-0.5">
                {msg.replyTo.senderName || 'پاسخ به'}:
              </span>
              <p className="line-clamp-1 opacity-80">{msg.replyTo.text}</p>
            </div>
          )}

          <p className="whitespace-pre-wrap select-text">{msg.text}</p>
          <div
            className={`flex items-center gap-1 mt-1 text-[10px] ${
              isMe ? 'text-white/65 justify-end' : 'text-white/45 justify-start'
            }`}
          >
            <span>{persianNumber(msg.timestamp)}</span>
            {isMe && <CheckCheck className="w-3 h-3 text-sky-300" />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
