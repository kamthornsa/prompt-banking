import Image from "next/image";

const LOGOS = [
  { src: "/logos/logo-mhesi.png", alt: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)", height: 56 },
  { src: "/logos/logo-bpt.png", alt: "หน่วยบริหารจัดการทุนด้านการพัฒนาพื้นที่ (บพท.)", height: 48 },
  { src: "/logos/logo-sksv.png", alt: "สกลว", height: 52 },
  { src: "/logos/logo-kalasin-uni.png", alt: "มหาวิทยาลัยกาฬสินธุ์", height: 56 },
  { src: "/logos/logo-craft-ai.png", alt: "Kalasin CRAFT AI", height: 52 },
  { src: "/logos/logo-saturday-school.png", alt: "Saturday School", height: 52 },
  { src: "/logos/logo-tdri.png", alt: "TDRI — Thailand Development Research Institute", height: 40 },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Project name strip */}
      <div className="bg-river/5 border-b border-river/10 py-4 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-1">
          <p className="font-serif font-bold text-river text-base">
            CARIA Classroom Prompt Banking
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            ธนาคารพรอมต์สำหรับครูโครงการ{" "}
            <span className="font-medium text-gray-700">Kalasin CRAFT AI</span>
            {" "}— พัฒนา Reading Literacy &amp; Critical Thinking ระดับ ม.1–3
          </p>
          <p className="text-xs text-gray-600 leading-relaxed max-w-3xl mx-auto">
            โครงการวิจัยเชิงปฏิบัติการแบบมีส่วนร่วมเพื่อพัฒนาความฉลาดรู้ด้านการอ่านและการคิดอย่างมีวิจารณญาณสําหรับนักเรียนมัธยมศึกษาตอนต้นของสถานศึกษาสังกัดองค์กรปกครองส่วนท้องถิ่นผ่านการพัฒนาครูและบูรณาการการใช้ปัญญาประดิษฐ์ (AI) ในจังหวัดกาฬสินธุ์
          </p>
          <p className="text-xs text-gray-400">
            ภายใต้ทุนสนับสนุนจาก บพท. สัญญาเลขที่ A13F680300
          </p>
        </div>
      </div>

      {/* Logos */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <p className="text-center text-xs text-gray-400 mb-4">หน่วยงานที่ร่วมสนับสนุน</p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {LOGOS.map((logo) => (
            <div
              key={logo.src}
              className="hover:opacity-100 opacity-75 transition-opacity bg-gray-50 rounded-lg p-2 flex items-center justify-center"
              style={{ height: logo.height + 16, width: logo.height * 2 + 16 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                  title={logo.alt}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 py-3 px-4">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Kalasin CRAFT AI — มหาวิทยาลัยกาฬสินธุ์
        </p>
      </div>
    </footer>
  );
}
