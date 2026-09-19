import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: swift macos_dmg_background.swift OUTPUT.png VERSION\n", stderr)
    exit(2)
}

let outputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let version = CommandLine.arguments[2]
let width = 680
let height = 420
let scale = 2

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width * scale,
    pixelsHigh: height * scale,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("Could not create the DMG background.\n", stderr)
    exit(1)
}

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat) -> NSColor {
    NSColor(calibratedRed: red / 255, green: green / 255, blue: blue / 255, alpha: 1)
}

func rounded(_ rect: NSRect, radius: CGFloat, fill: NSColor, stroke: NSColor? = nil) {
    let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
    fill.setFill()
    path.fill()
    if let stroke {
        stroke.setStroke()
        path.lineWidth = 1
        path.stroke()
    }
}

func label(_ text: String, x: CGFloat, y: CGFloat, size: CGFloat, weight: NSFont.Weight, ink: NSColor) {
    (text as NSString).draw(
        at: NSPoint(x: x, y: y),
        withAttributes: [
            .font: NSFont.systemFont(ofSize: size, weight: weight),
            .foregroundColor: ink,
        ]
    )
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.cgContext.scaleBy(x: CGFloat(scale), y: CGFloat(scale))

let canvas = color(244, 234, 223)
let surface = color(255, 253, 249)
let border = color(222, 215, 206)
let ink = color(44, 33, 28)
let muted = color(126, 105, 93)
let accent = color(138, 96, 66)

canvas.setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()
rounded(NSRect(x: 20, y: 18, width: 640, height: 384), radius: 22, fill: surface, stroke: border)
rounded(NSRect(x: 43, y: 314, width: 594, height: 1), radius: 0, fill: border)

label("Kapivara", x: 48, y: 344, size: 27, weight: .semibold, ink: ink)
label("Drag the app to Applications", x: 49, y: 322, size: 12, weight: .regular, ink: muted)
label("v\(version)  ·  macOS Universal", x: 449, y: 353, size: 11, weight: .medium, ink: muted)

rounded(NSRect(x: 75, y: 88, width: 202, height: 198), radius: 20, fill: canvas, stroke: border)
rounded(NSRect(x: 403, y: 88, width: 202, height: 198), radius: 20, fill: canvas, stroke: border)

let arrow = NSBezierPath()
arrow.move(to: NSPoint(x: 310, y: 185))
arrow.line(to: NSPoint(x: 369, y: 185))
arrow.move(to: NSPoint(x: 354, y: 199))
arrow.line(to: NSPoint(x: 369, y: 185))
arrow.line(to: NSPoint(x: 354, y: 171))
accent.setStroke()
arrow.lineWidth = 3
arrow.lineCapStyle = .round
arrow.lineJoinStyle = .round
arrow.stroke()

label("KAPIVARA", x: 133, y: 106, size: 10, weight: .semibold, ink: muted)
label("APPLICATIONS", x: 457, y: 106, size: 10, weight: .semibold, ink: muted)
label("Install once. Your data stays local.", x: 49, y: 45, size: 12, weight: .regular, ink: muted)

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let data = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Could not encode the DMG background.\n", stderr)
    exit(1)
}
try data.write(to: outputURL, options: .atomic)
