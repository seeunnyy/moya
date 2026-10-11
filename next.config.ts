import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 서버에 같은 와이파이의 휴대폰으로 접속할 때(http://192.168.x.x:3000 등) 화면 스크립트가 막히지 않게
  // 사설망 주소만 허용한다. 개발 서버에만 해당하고 배포 빌드와는 상관없다 (planning/md-design/05 §6 실기기 확인).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
