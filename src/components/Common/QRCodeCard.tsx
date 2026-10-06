import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeCardProps {
  pin: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ pin }) => {
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?role=student&pin=${pin}`
    : `https://quiz.school/?pin=${pin}`;

  // Simple clean QR code matrix generator (using google chart qr API as img fallback, with high reliability)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}&bgcolor=1e293b&color=38bdf8&margin=4`;

  const copyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openStudentWindow = () => {
    window.open(`/?role=student&pin=${pin}`, '_blank');
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center gap-6">
      <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
        <img
          src={qrImageUrl}
          alt={`QR Code to join room PIN ${pin}`}
          className="w-36 h-36 rounded-lg object-contain bg-slate-900"
          onError={(e) => {
            // fallback icon if offline
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5 text-sky-400" />
          스마트폰/태블릿 스캔
        </div>
      </div>

      <div className="flex-1 text-center md:text-left space-y-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-400/20">
            Room PIN
          </span>
          <div className="text-4xl md:text-5xl font-extrabold tracking-widest text-white font-mono mt-1.5 drop-shadow-md">
            {pin}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            학생은 학년-반-번호와 이름을 입력하고 PIN 번호로 즉시 입장합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 justify-center md:justify-start">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-xs font-semibold text-slate-200 rounded-lg transition-all"
            title="접속 링크 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            {copied ? '복사 완료!' : '접속 링크 복사'}
          </button>

          <button
            onClick={openStudentWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-300 rounded-lg transition-all active:scale-95"
            title="새 탭에서 학생 화면 열기 (테스트용)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            학생 화면 새 탭 열기
          </button>
        </div>
      </div>
    </div>
  );
};
