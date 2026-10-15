
export default function SunBackground() {
  return (
    <div className="sun-background" aria-hidden="true">
      <svg
        className="sun-doodle"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M101 12 L105 32 M78 17 L84 34 M126 17 L119 34" />
          <path d="M99 169 L96 188 M122 166 L128 182 M76 168 L72 184" />
          <path d="M12 101 L32 97 M18 77 L35 83 M18 125 L34 119" />
          <path d="M168 100 L188 104 M166 78 L183 73 M165 123 L183 130" />
          <path d="M36 36 L51 52 M52 23 L61 39 M24 52 L40 60" />
          <path d="M149 148 L165 164 M164 37 L150 52 M180 49 L164 61" />
          <path d="M37 163 L52 149 M23 145 L41 137 M148 24 L139 41" />
          <path d="M57 45 Q47 55 46 65 M145 48 Q155 57 156 67" />
          <path d="M46 135 Q50 146 61 152 M140 151 Q151 142 154 132" />

          <path d="
            M101 56
            C80 53 60 68 59 90
            C57 113 76 133 98 132
            C120 132 137 116 137 96
            C138 76 120 62 101 65
            C84 66 72 79 74 94
            C76 108 90 117 103 110
            C115 104 117 91 108 83
            C101 77 90 81 88 90
            C86 97 94 102 100 97
            C104 94 101 90 98 91
          " />

          <path d="M64 69 Q59 79 61 88" />
          <path d="M123 122 Q115 131 105 132" />
          <path d="M135 84 Q142 93 137 105" />
        </g>
      </svg>
    </div>
  );
}
