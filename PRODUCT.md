# Product

<!-- impeccable:product-schema 1 -->

## Platform

Desktop application for Windows, macOS, and Linux, built with Wails v2. Its interface is implemented as a React and TypeScript webview, but product and interaction decisions must follow desktop application conventions rather than website conventions.

## Users

Inferred from the repository and supplied brief: developers and API practitioners working in a desktop application who need to organize and execute HTTP requests without the visual noise of a large API platform.

## Product Purpose

Kapivara is a local-first desktop REST client. It lets users organize requests into isolated projects, work with project and global environments, resolve variables, execute HTTP requests, and keep useful responses.

## Positioning

Inferred: a calmer, focused API workspace with a small desktop footprint and local SQLite persistence.

## Operating Context

Users create or reopen a project, organize requests into nested collections, configure authentication, headers, parameters and bodies, then inspect and optionally save responses.

## Capabilities and Constraints

- Wails desktop shell with a React and TypeScript interface.
- Local SQLite persistence.
- Existing project creation, opening, search and deletion behavior must remain intact.
- The home screen is an operational entry point, not a marketing website.
- Importing external collections and opening sample projects are not currently implemented and must not be presented as working actions.

## Brand Commitments

- Product name: Kapivara.
- Capybara artwork is a recognizable product asset.
- User-supplied visual references establish a warm, calm, professional desktop-tool direction.
- The interface should feel serious and production-oriented rather than playful or toy-like.
- IBM Plex Sans and IBM Plex Mono provide the current typographic voice.
- Warm neutral surfaces and restrained blue actions are the primary visual system; the capybara artwork is used selectively as brand identity, not as decoration throughout the interface.

## Current Application Shell

- Kapivara uses a custom 58 px frameless Wails title bar.
- The top bar contains brand identity, project selection and creation, environment selection, search, general settings, and native window controls.
- Primary navigation is a persistent left rail for Requests, Environments, Variables, History, and Settings.
- Projects use direct selection through `activeProjectId`; the former top-tab navigation model has been removed.
- Project and global environments may be active simultaneously, with project variables taking precedence.

## Evidence on Hand

- Existing product implementation and README.
- Brand artwork in `frontend/src/assets/images/`.
- User-supplied home-screen reference image.
- No testimonials, customer logos, usage metrics, or import workflow are available and none should be fabricated.

## Product Principles

- Put the next useful action in reach immediately.
- Keep project boundaries and local ownership understandable.
- Favor calm focus over dense application chrome.
- Preserve honest product functionality in every visible control.
