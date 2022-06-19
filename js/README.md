# Bit interpreter
# TODO
- load / save
  - have server-side repository of programs
  - allow user to save to localstorage
  - read from both when loading
- step
- refactor running:
  - have app run entire code in background, and save bit at each step
  - when playing, simply show each step in bit window and update active line in code window
  - can then step forward/back as necessary
- Add bit documentation (translate Nick's Python to JS)

# Bit world info:
A world looks like this:

```
wwwwwww
w     w
w     w
w>r WWw
wwwwwww
```
Outer walls (which don't show up in the bit world) are lowercase `w`, and inner walls are uppercase `W`.

Bits look like:
```
>
^
<
v
```
Colors when *not* under a bit are `r`, `g`, `b`.
If a color is *under* bit, it will be in the position after bit and be uppercase (e.g., `R`, `G`, `B`). E.g.,

```
wwwwwww
w     w
w     w
w>R  WWw
wwwwwww
```
This does make the ascii art a bit wonky, but this is still a rectangular bit.

