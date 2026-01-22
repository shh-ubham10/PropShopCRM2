"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"

let ffmpegInstance = null

export async function convertM4AToMP4(m4aUrl) {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg()
    await ffmpegInstance.load()
  }

  const inputData = await fetchFile(m4aUrl)

  await ffmpegInstance.writeFile("input.m4a", inputData)

  await ffmpegInstance.exec([
    "-i", "input.m4a",
    "-c:a", "aac",
    "-b:a", "128k",
    "output.mp4",
  ])

  const data = await ffmpegInstance.readFile("output.mp4")

  return URL.createObjectURL(
    new Blob([data.buffer], { type: "audio/mp4" })
  )
}
