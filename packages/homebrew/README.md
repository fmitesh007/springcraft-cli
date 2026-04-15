# Homebrew Tap

## Option 1: Personal Tap (Recommended for testing)

1. **Create a personal tap:**
   ```bash
   brew tap fmitesh/springcraft https://github.com/fmitesh007/homebrew-springcraft
   ```

2. **Create the tap repo on GitHub:**
   - Go to https://github.com/new
   - Name: `homebrew-springcraft`
   - Clone it locally

3. **Copy the formula:**
   ```bash
   cp /path/to/springcraft/dist/homebrew/springcraft.rb Formula/
   git add . && git commit -m "Add springcraft v0.3.0"
   git push
   ```

4. **Install:**
   ```bash
   brew install fmitesh/springcraft/springcraft
   ```

## Option 2: Submit to Homebrew Core (Official)

1. **Fork Homebrew/core:**
   ```bash
   brew install hub
   hub fork
   ```

2. **Create a PR:**
   ```bash
   cd $(brew --repository)/Library/Taps/homebrew/homebrew-core
   cp /path/to/springcraft/dist/homebrew/springcraft.rb Formula/springcraft.rb
   hub fork && git push YOUR_USER
   hub pull-request
   ```

3. **Meet requirements:**
   - Must have 50+ open-source forks
   - Maintainer responds within 2 weeks
   - Passes CI checks

## Notes
- Personal tap is instant, no approval needed
- Homebrew core requires review and adherence to strict guidelines
