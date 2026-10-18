export interface CommitteeMemberItem {
  id: string;
  position: string;
  code: string;
  name: string;
  memberNumber: string;
  motorcycle: string;
  roleDescription: string;
  iconName?: "Shield" | "Award" | "Users" | "Compass" | "Wrench" | "Megaphone" | "Star" | "Zap";
  avatarUrl?: string;
}

export interface CommitteePageData {
  badge: string;
  title: string;
  description: string;
  commitmentTitle: string;
  commitmentDescription: string;
  members: CommitteeMemberItem[];
  updatedAt?: string;
}

export const PRESET_AVATARS = [
  {
    label: "Rider Executive 1",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 2",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 3",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 4",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 5",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 6",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Executive 7",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Rider Touring Helm",
    url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
  },
];

export const DEFAULT_COMMITTEE_DATA: CommitteePageData = {
  badge: "Organisasi & Kepengurusan",
  title: "Dewan Pengurus & Pejabat Komunitas",
  description:
    "Struktur kepengurusan Brotherhood Community Periode 2024–2027. Dipilih secara demokratis dalam Musyawarah Besar untuk melayani seluruh anggota dengan integritas dan dedikasi penuh.",
  commitmentTitle: "Prinsip Kepemimpinan Melayani",
  commitmentDescription:
    "Pengurus Brotherhood tidak menerima gaji atau kompensasi komersial apa pun dari uang kas organisasi. Seluruh jabatan diemban secara sukarela atas dasar kecintaan pada dunia motor touring dan dedikasi memajukan persaudaraan anggota.",
  members: [
    {
      id: "comm-01",
      position: "Ketua Umum (President)",
      code: "PRESIDENT",
      name: "Aryo Perkasa, S.T.",
      memberNumber: "BMC-2018-0001",
      motorcycle: "BMW R1250GS Adventure",
      roleDescription:
        "Penanggung jawab utama seluruh kegiatan, hubungan eksternal antar-klub, dan arah strategis komunitas.",
      iconName: "Shield",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-02",
      position: "Wakil Ketua Umum (Vice President)",
      code: "VP",
      name: "Hendrik 'Bison' Santoso",
      memberNumber: "BMC-2018-0004",
      motorcycle: "Honda Africa Twin 1100L",
      roleDescription:
        "Mengoordinasikan urusan operasional internal, kedisiplinan anggota, dan memimpin rapat rutin dewan pengurus.",
      iconName: "Award",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-03",
      position: "Sekretaris Jenderal",
      code: "SEKJEN",
      name: "Farhan Mahendra",
      memberNumber: "BMC-2019-0015",
      motorcycle: "Yamaha Tracer 900 GT",
      roleDescription:
        "Administrasi keanggotaan, verifikasi formulir pendaftaran, korespondensi resmi, dan penerbitan KTA digital.",
      iconName: "Users",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-04",
      position: "Bendahara Umum",
      code: "BENDAHARA",
      name: "Rizky 'Kikuk' Ardiansyah, S.E.",
      memberNumber: "BMC-2019-0021",
      motorcycle: "Kawasaki Versys 650",
      roleDescription:
        "Pengelolaan rekening kas organisasi, verifikasi bukti transfer event, serta penyusunan laporan keuangan transparan.",
      iconName: "Award",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-05",
      position: "Divisi Touring & Road Captain (RC)",
      code: "RC",
      name: "Kapten Dimas Prabowo",
      memberNumber: "BMC-2018-0008",
      motorcycle: "Triumph Tiger 900 Rally Pro",
      roleDescription:
        "Penyusunan rute touring, survei kondisi aspal, penentuan rest area, dan komando barisan konvoi saat di jalan raya.",
      iconName: "Compass",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-06",
      position: "Divisi Safety & Tata Tertib (Safety Officer)",
      code: "SAFETY",
      name: "Bripka (Purn) Teguh Supriyadi",
      memberNumber: "BMC-2020-0033",
      motorcycle: "Honda CB500X",
      roleDescription:
        "Pemeriksaan kelayakan teknis motor, briefing safety riding, dan penegakan etika santun di jalanan.",
      iconName: "Wrench",
      avatarUrl:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "comm-07",
      position: "Divisi Humas & Dokumentasi Media",
      code: "HUMAS",
      name: "Ilham Satria",
      memberNumber: "BMC-2021-0056",
      motorcycle: "Suzuki V-Strom 650",
      roleDescription:
        "Pengelolaan website berita, dokumentasi foto & video ekspedisi, serta kemitraan sosial kemasyarakatan.",
      iconName: "Megaphone",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    },
  ],
};
