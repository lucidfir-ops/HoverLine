Hoverline · same-Wi-Fi host

Use this when there is no internet, or to keep a race on your own network.
1. On the Steam Deck (desktop mode), a Linux PC or a Mac: run "Host for Phone or Tablet.sh"
   (or: python3 wifi-host.py). It prints an address like http://192.168.1.20:5198/
2. On every phone and tablet on the same Wi-Fi, open that address in the browser.
3. Multiplayer -> the "Same Wi-Fi host" connection is selected -> one player creates a room,
   everyone else joins with the code.

Notes
- Everyone in a room must use the same connection. On itch.io, use Internet: it also works on one Wi-Fi.
- Up to 8 pilots per race. Keep the host window open while playing.
- Tilt steering needs a secure page on some phones (Android Chrome allows it on a local address; iOS may not).
