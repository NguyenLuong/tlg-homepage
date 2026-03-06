/**
 * Default homepage content fallback
 * Used when database content is unavailable
 */

export const DEFAULT_HOMEPAGE_CONTENT = {
  vi: {
    hero: {
      badge: "Công ty Cổ phần TLG",
      title: "Vươn tới tương lai",
      description:
        "TLG kết nối ứng viên nước ngoài với doanh nghiệp uy tín tại Nhật Bản qua quy trình tuyển dụng rõ ràng và hỗ trợ thích nghi.",
      primaryCtaLabel: "Xem công việc",
      bannerImageId: null,
    },
    achievementsSection: {
      heroCta: {
        leadQuestion: "Bạn đang gặp khó khăn vì thiếu nhân lực?",
        title: "Tuyển dụng nhân lực nước ngoài? Hãy để ",
        titleHighlight: "TLG",
        titleRemaining: " lo liệu.",
        description: "Hỗ trợ toàn diện từ tuyển dụng đến ổn định công việc.",
      },
      whyChooseUs: {
        subtitle: "Why Choose Us",
        title: "Tại sao nên chọn chúng tôi?",
        features: [
          {
            title: "Kinh nghiệm hỗ trợ nhân lực nước ngoài",
            description:
              "Tận dụng kinh nghiệm hỗ trợ thực tập sinh kỹ thuật, chúng tôi hỗ trợ tận tình cho cả doanh nghiệp và nhân lực nước ngoài.",
          },
          {
            title: "Hỗ trợ từ tuyển dụng đến ổn định",
            description:
              "Không chỉ giới thiệu nhân sự mà còn hỗ trợ theo dõi sau khi bắt đầu công việc.",
          },
          {
            title: "Đáp ứng nhân lực trong và ngoài nước",
            description:
              "Chúng tôi có thể giới thiệu nhân lực đang ở Nhật Bản lẫn ở nước ngoài.",
          },
          {
            title: "Tuyển dụng nhân sự nhanh chóng",
            description: "Đáp ứng nhanh chóng theo nhu cầu của doanh nghiệp.",
          },
          {
            title: "Phản ứng nhanh trong trường hợp khẩn cấp",
            description: "Xử lý kịp thời các sự cố và khó khăn phát sinh.",
          },
        ],
      },
      specifiedSkill: {
        subtitle: "Specified Skilled Worker",
        title: "Kỹ năng chuyên môn là gì?",
        description:
          "Kỹ năng đặc định là chế độ tư cách lưu trú được thiết lập để người nước ngoài có trình độ kỹ thuật và năng lực tiếng Nhật nhất định có thể làm việc trong các ngành nghề đang thiếu hụt nhân lực trầm trọng tại Nhật Bản. Được áp dụng từ tháng 4 năm 2019, chế độ này cho phép làm việc như lực lượng lao động chủ lực trong các lĩnh vực do chính phủ Nhật Bản chỉ định.",
        note: "※Các ngành nghề có thể tiếp nhận được quy định theo Phân loại ngành công nghiệp tiêu chuẩn Nhật Bản. Khi chuyển từ thực tập sinh kỹ thuật sang kỹ năng đặc định, cũng cần xác nhận xem có thuộc phân loại ngành được chỉ định hay không.",
        tags: [
          {
            label: "🏭 Lĩnh vực đối tượng",
            text: "Bao gồm 14 ngành nghề như nông nghiệp, xây dựng, khách sạn, điều dưỡng, dịch vụ ăn uống, v.v.",
          },
          {
            label: "📋 Tư cách lưu trú",
            text: 'Có "Kỹ năng đặc định số 1" (tối đa 5 năm, không được mang theo gia đình) và "Kỹ năng đặc định số 2" (không giới hạn thời gian, được mang theo gia đình).',
          },
          {
            label: "✅ Điều kiện",
            text: "Người nước ngoài cần đạt kỳ thi kỹ năng và kỳ thi năng lực tiếng Nhật (thường từ N4 trở lên).",
          },
        ],
      },
      systemFeatures: {
        subtitle: "System Features",
        title: "Đặc điểm của Hệ thống Lao động lành nghề Chuyên ngành",
        columnHeaders: ["Hạng mục", "Nội dung"] as [string, string],
        rows: [
          {
            label: "Mục đích",
            value:
              "Đảm bảo lực lượng lao động chủ lực bù đắp tình trạng thiếu hụt nhân lực trầm trọng",
          },
          {
            label: "Giới hạn số lượng",
            value: "Không giới hạn (trừ ngành xây dựng và điều dưỡng)",
          },
          {
            label: "Năng lực tiếng Nhật",
            value: "Kỳ thi năng lực tiếng Nhật từ N4 trở lên",
          },
          {
            label: "Chuyển việc",
            value: "Có thể chuyển việc trong cùng ngành nghề",
          },
          {
            label: "Gia đình đi kèm",
            value: "Chỉ được phép với số 2",
          },
          {
            label: "Trình độ kỹ năng",
            value: "Nhân lực có thể làm việc ngay",
          },
        ],
      },
      supportServices: {
        subtitle: "Support Services",
        title: "Nội dung hỗ trợ",
        items: [
          "Hướng dẫn trước khi nhập cảnh",
          "Đưa đón khi xuất nhập cảnh",
          "Hỗ trợ tìm nhà ở và các hợp đồng cần thiết cho cuộc sống",
          "Định hướng cuộc sống",
          "Đồng hành trong các thủ tục hành chính",
          "Cung cấp cơ hội học tiếng Nhật",
          "Giải đáp thắc mắc và khiếu nại",
          "Phỏng vấn định kỳ và báo cáo cho cơ quan hành chính",
          "Thúc đẩy giao lưu với người Nhật",
          "Hỗ trợ chuyển việc (trong trường hợp cắt giảm nhân sự)",
        ],
      },
      processFlow: {
        subtitle: "Process Flow",
        title: "Quy trình tiếp nhận",
        steps: [
          {
            title: "Tiếp nhận tuyển dụng",
            description:
              "Lập danh sách ứng viên trong và ngoài nước dựa trên số lượng tuyển dụng dự kiến và điều kiện lao động của doanh nghiệp.",
          },
          {
            title: "Phỏng vấn và tuyển chọn",
            description:
              "Tiến hành phỏng vấn ứng viên bởi đại diện doanh nghiệp và nhân viên công ty, đánh giá toàn diện bao gồm khả năng tiếng Nhật để quyết định tuyển dụng.",
          },
          {
            title: "Hướng dẫn trước",
            description:
              "Nhân viên công ty hướng dẫn ứng viên trúng tuyển về quy tắc công việc, môi trường sống và các lưu ý khi sinh sống tại Nhật Bản.",
          },
          {
            title: "Thủ tục xin phép và phê duyệt",
            description:
              "Hỗ trợ lập hồ sơ dựa trên thông tin doanh nghiệp và ứng viên, chuẩn bị hồ sơ xin cấp tư cách lưu trú. Sau khi được phê duyệt, tiến hành điều chỉnh lịch trình đến ngày bắt đầu làm việc.",
          },
          {
            title: "Chuyển chỗ ở",
            description:
              "Thực hiện thủ tục chuyển chỗ ở và chuẩn bị sinh hoạt hằng ngày để ứng viên bắt đầu làm việc. Nhân viên công ty sẽ hỗ trợ khi cần thiết.",
          },
          {
            title: "Bắt đầu làm việc",
            description:
              "Sau khi mọi thủ tục hoàn tất, chính thức bắt đầu làm việc. TLG sẽ tiếp tục hỗ trợ sau khi nhận việc.",
          },
        ],
      },
    },
    blogSection: {
      title: "Tin tức và góc nhìn",
      description:
        "Cập nhật xu hướng tuyển dụng, kinh nghiệm phỏng vấn và thông tin mới từ đội ngũ TLG.",
      ctaLabel: "Đến trang tin tức",
    },
    spotlights: [
      {
        title: "Chuẩn bị phỏng vấn kỹ thuật tại Nhật Bản",
        summary:
          "Danh sách kiểm tra thực tế về CV, cách giao tiếp và kỳ vọng thường gặp trong phỏng vấn tại doanh nghiệp Nhật.",
        href: "/news",
        linkLabel: "Đọc tại Tin tức",
      },
      {
        title: "Xu hướng tuyển dụng nổi bật theo quý",
        summary:
          "Tổng hợp những nhóm ngành đang tăng trưởng và cách ứng viên có thể nâng cao lợi thế cạnh tranh.",
        href: "/jobs",
        linkLabel: "Xem việc làm",
      },
    ],
  },
  ja: {
    hero: {
      badge: "TLG株式会社",
      title: "未来へ羽ばたく",
      description:
        "TLGは、明確な採用プロセスと適応サポートを通じて、海外の応募者と日本の信頼できる企業を繋ぎます。",
      primaryCtaLabel: "求人を見る",
      bannerImageId: null,
    },
    employerCard: {
      label: "企業向け",
      description: "事前選考済みの候補者とつながり、採用スピードを高めます。",
    },
    achievementsSection: {
      heroCta: {
        leadQuestion: "人手不足でお困りではありませんか？",
        title: "外国人材の採用なら",
        titleHighlight: "TLG",
        titleRemaining: "にお任せください。",
        description: "採用から定着までトータルサポートいたします。",
      },
      whyChooseUs: {
        subtitle: "Why Choose Us",
        title: "私たちが選ばれる理由",
        features: [
          {
            title: "外国人材支援の経験",
            description:
              "技能実習生のサポート経験を活かし、企業様と外国人材を丁寧に支援します。",
          },
          {
            title: "採用から定着までサポート",
            description:
              "人材のご紹介だけでなく、就業後のフォローまで対応します。",
          },
          {
            title: "国内外の人材に対応",
            description: "日本在住・海外在住どちらの人材もご紹介可能です。",
          },
          {
            title: "スピーディーな人材募集",
            description: "企業様のニーズに合わせて迅速に対応します。",
          },
          {
            title: "緊急時の迅速対応",
            description: "トラブルやお困りごとにもすぐに対応します。",
          },
        ],
      },
      specifiedSkill: {
        subtitle: "Specified Skilled Worker",
        title: "特定技能とは",
        description:
          "特定技能は、日本国内で深刻な人手不足が続く産業分野において、一定の技術・技能と日本語能力を持つ外国人が就労できるよう創設された在留資格制度です。2019年4月から導入され、日本政府が指定する分野での即戦力としての就労が可能となっています。",
        note: "※受入可能な職種は、日本標準産業分類で定義されています。技能実習から特定技能に変更する場合も、指定産業分類に該当するかの確認が必要です。",
        tags: [
          {
            label: "🏭 対象分野",
            text: "農業、建設、宿泊、介護、外食業など14業種が対象となります。",
          },
          {
            label: "📋 在留資格",
            text: "「特定技能1号」（5年以内、家族帯同不可）と「特定技能2号」（無期限、家族帯同可能）があります。",
          },
          {
            label: "✅ 条件",
            text: "外国人は、技能試験や日本語能力試験（通常N4以上）に合格する必要があります。",
          },
        ],
      },
      systemFeatures: {
        subtitle: "System Features",
        title: "特定技能制度の特徴",
        columnHeaders: ["項目", "内容"] as [string, string],
        rows: [
          {
            label: "目的",
            value: "深刻な人手不足を補う即戦力・労働力の確保",
          },
          {
            label: "人数制限",
            value: "建設分野・介護分野を除いて無し",
          },
          {
            label: "日本語能力",
            value: "日本語能力試験　N4相当以上",
          },
          {
            label: "転職",
            value: "同一職種であれば転職が可能",
          },
          {
            label: "家族滞在",
            value: "2号のみ可",
          },
          {
            label: "技能水準",
            value: "即戦力となる人材",
          },
        ],
      },
      supportServices: {
        subtitle: "Support Services",
        title: "支援内容",
        items: [
          "事前ガイダンス",
          "出入国する際の送迎",
          "住居確保・生活に必要な契約支援",
          "生活オリエンテーション",
          "公的手続き等への同行",
          "日本語学習の機会の提供",
          "相談・苦情への対応",
          "定期的な面談・行政機関への通報",
          "日本人との交流促進",
          "転職支援（人員整理等の場合）",
        ],
      },
      processFlow: {
        subtitle: "Process Flow",
        title: "受け入れの流れ",
        steps: [
          {
            title: "求人受付",
            description:
              "企業様の採用予定人数・労働条件を元に国内外の求人応募者をリストアップします。",
          },
          {
            title: "面接・選考",
            description:
              "求人応募者に対して、企業担当者、当社スタッフによる面接を行い、日本語理解力等、総合的に判断をして採用者を決めます。",
          },
          {
            title: "事前ガイダンス",
            description:
              "当社スタッフが合格者に仕事上のルール他、日本で生活する際の環境、注意事項等を説明いたします。",
          },
          {
            title: "申請手続き、許可承認",
            description:
              "企業様、内定者の情報を元に書類作成サポート、入管申請の準備、入管にて内定者の申請許可が下り次第、就業開始日までの日程調整となります。",
          },
          {
            title: "転居",
            description:
              "内定者が企業様で働くために転居等の手続き、その他日常生活の準備を行います、必要があれば当社スタッフがサポートいたします。",
          },
          {
            title: "就業開始",
            description:
              "すべての準備が整い、いよいよ就業スタートとなります。就業後もTLGが引き続きサポートいたします。",
          },
        ],
      },
    },
    blogSection: {
      title: "最新情報とナレッジ",
      description: "採用トレンド、面接対策、TLG からのお知らせを確認できます。",
      ctaLabel: "ニュースを見る",
    },
    spotlights: [
      {
        title: "日本企業向け技術面接の準備ポイント",
        summary:
          "履歴書形式、コミュニケーション、評価観点を実務ベースで整理しました。",
        href: "/news",
        linkLabel: "ニュースで読む",
      },
      {
        title: "四半期ごとの採用トレンド",
        summary:
          "成長職種や企業側の注目ポイントを把握し、応募戦略に活かせます。",
        href: "/jobs",
        linkLabel: "求人を見る",
      },
    ],
  },
};
