require 'brewkit/formula'

class Springcraft < Formula
  desc 'Modern CLI scaffolder for Spring Boot projects'
  homepage 'https://github.com/fmitesh007/springcraft-cli'
  url 'https://github.com/fmitesh007/springcraft-cli/releases/download/v0.3.1/springcraft-macos'
  sha256 '7edf7c5e3506fb9cecdc7eb92acdd25c73f7450742ed85824c2994a51fa31879'
  license 'MIT'
  version '0.3.1'

  def install
    bin.install 'springcraft-macos' => 'springcraft'
  end

  test do
    system "#{bin}/springcraft --version"
  end
end
