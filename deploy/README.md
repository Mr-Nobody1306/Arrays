# Phone Contacts — Arrays in C++ (static deploy)

## Run the website
Option A (simplest): open `index.html` directly in a browser.
Option B (recommended, fetch() for .cpp needs http): from this folder run

  python3 -m http.server 8000
  # then open http://localhost:8000

## Compile the C++ apps
  g++ -std=c++17 -O2 -o contacts contacts.cpp && ./contacts
  g++ -std=c++17 -O2 -o gradebook gradebook.cpp && ./gradebook

## Files
- index.html .... interactive guide + phone contact app (no build step)
- contacts.cpp . phone contacts on Contact contacts[8] (the featured app)
