// "use client"
// import "../styles/professional-dashboard.css"

// export default function AudioModal({ src, filename, meta = {}, onClose }) {
//   return (
//     <div className="modal active" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
//         <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#111827" }}>🎵 Call Recording</h3>

//         <div style={{ marginBottom: "16px" }}>
//           <audio controls style={{ width: "100%", borderRadius: "6px", height: "32px" }}>
//             <source src={src} />
//             Your browser does not support the audio element.
//           </audio>
//         </div>

//         <div
//           style={{
//             background: "#f9fafb",
//             border: "1px solid #e5e7eb",
//             borderRadius: "6px",
//             padding: "12px",
//             marginBottom: "16px",
//             fontSize: "12px",
//           }}
//         >
//           <div style={{ lineHeight: "1.6", color: "#374151" }}>
//             <div>
//               <strong>Filename:</strong> {filename}
//             </div>
//             {meta.employeeId && (
//               <div>
//                 <strong>Employee:</strong> {meta.employeeId}
//               </div>
//             )}
//             {meta.phoneNumber && (
//               <div>
//                 <strong>Number:</strong> {meta.phoneNumber}
//               </div>
//             )}
//             {meta.when && (
//               <div>
//                 <strong>Date/Time:</strong> {meta.when}
//               </div>
//             )}
//           </div>
//         </div>

//         <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
//           <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: "12px" }}>
//             Close
//           </button>
//           <a href={src} download className="btn btn-primary" style={{ textDecoration: "none", fontSize: "12px" }}>
//             ⬇️ Download
//           </a>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import "../styles/professional-dashboard.css"
import { convertM4AToMP4 } from "../../src/utils/audio/convertM4AToMP4"

export default function AudioModal({ src, filename, meta = {}, onClose }) {
  const [playableSrc, setPlayableSrc] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function prepareAudio() {
      setLoading(true)

      try {
        if (src.endsWith(".m4a")) {
          const converted = await convertM4AToMP4(src)
          if (mounted) setPlayableSrc(converted)
        } else {
          setPlayableSrc(src)
        }
      } catch (e) {
        console.error("Audio conversion failed", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    prepareAudio()
    return () => (mounted = false)
  }, [src])

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
        <h3>🎵 Call Recording</h3>

        {loading ? (
          <p style={{ fontSize: "12px" }}>Converting audio…</p>
        ) : (
          playableSrc && (
            <audio controls style={{ width: "100%" }}>
              <source src={playableSrc} type="audio/mp4" />
              Your browser does not support audio playback.
            </audio>
          )
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {playableSrc && (
            <a href={playableSrc} download={filename.replace(".m4a", ".mp4")} className="btn btn-primary">
              ⬇️ Download
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
