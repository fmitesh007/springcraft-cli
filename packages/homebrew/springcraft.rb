require 'brewkit/formula'

class Springcraft < Formula
  desc 'Modern CLI scaffolder for Spring Boot projects'
  homepage 'https://github.com/fmitesh007/springcraft-cli'
  url 'https://github.com/fmitesh007/springcraft-cli/releases/download/v0.3.0/springcraft-macos'
  sha256 '7c6b45ba39f28aa5dd116672b427a3b919cf2376bfbf1126cad32213f5f42c17'
  license 'MIT'
  version '0.3.0'

  def install
    bin.install 'springcraft-macos' => 'springcraft'
  end

  test do
    system "#{bin}/springcraft --version"
  end
end
