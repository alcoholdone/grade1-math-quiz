import { Question } from "./chapters";

// ฟังก์ชันสุ่มสลับตำแหน่งอาร์เรย์
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// แปลงตัวเลขเป็นเลขไทย
const toThaiNum = (n: number): string => {
  const thaiNums = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙", "๑๐"];
  return thaiNums[n] || String(n);
};

// แปลงตัวเลขเป็นตัวหนังสือภาษาไทย
const toThaiText = (n: number): string => {
  const thaiTexts = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ"];
  return thaiTexts[n] || String(n);
};

const EMOJIS = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍦", "🦁", "🐼", "🐸", "🐷", "🐻", "🐰", "🦊", "🐶", "🐱", "🚗", "🚲", "⛵", "✈️", "🏀", "⚽", "🎈", "🎁", "🎨", "🐦", "🦖", "🍦"];

// สุ่มเลือก Emoji แบบไม่ซ้ำกัน
function getRandomEmojis(count: number): string[] {
  return shuffleArray(EMOJIS).slice(0, count);
}

// สร้างตัวเลือกผิด 3 ตัวเลือกที่ไม่ซ้ำกับคำตอบถูก และมีขอบเขตระหว่าง 0-10
function generateWrongOptions(correctVal: number, format: "arabic" | "thai" | "text" | "thaiText"): string[] {
  const wrongNumbers = new Set<number>();
  while (wrongNumbers.size < 3) {
    const r = Math.floor(Math.random() * 11);
    if (r !== correctVal) {
      wrongNumbers.add(r);
    }
  }

  return Array.from(wrongNumbers).map(n => {
    if (format === "thai") return toThaiNum(n);
    if (format === "text" || format === "thaiText") return toThaiText(n);
    return String(n);
  });
}

// =============================================================================
//  Question Generator Engine
// =============================================================================
export function generateQuestions(chapterId: string, count: number = 10): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    if (chapterId === "counting") {
      // -----------------------------------------------------------------------
      // บทที่ 1: รู้จักจำนวน 1 ถึง 10 และ 0
      // -----------------------------------------------------------------------
      const subTopic = i % 3; // 0: การเขียนตัวเลข, 1: การเปรียบเทียบ, 2: การเรียงลำดับ
      const emojis = getRandomEmojis(2);

      if (subTopic === 0) {
        // หัวข้อ 1: การเขียนตัวเลขฮินดู อารบิก เลขไทย และตัวหนังสือตามจำนวน (Choice หรือ Dragdrop)
        const isDragDrop = Math.random() > 0.6; // สุ่มประเภทคำถาม
        const n = Math.floor(Math.random() * 11); // 0 ถึง 10
        const selectedEmoji = emojis[0];

        if (!isDragDrop) {
          // โหมด Choice
          const formats: ("arabic" | "thai" | "text")[] = ["arabic", "thai", "text"];
          const format = formats[Math.floor(Math.random() * formats.length)];
          
          let qText = "";
          let aText = "";
          let correct = "";
          
          if (format === "thai") {
            correct = toThaiNum(n) + " ตัว";
            qText = `มีจำนวน ${selectedEmoji} อยู่กี่ตัวเอ่ย? (ตอบเป็นเลขไทยนะจ๊ะ)`;
            aText = `มีจำนวน ${selectedEmoji} อยู่กี่ตัวเอ่ย ตอบเป็นเลขไทยนะจ๊ะ`;
          } else if (format === "text") {
            correct = toThaiText(n);
            qText = `นับจำนวน ${selectedEmoji} กันเถอะ! มีทั้งหมดกี่ตัว? (ตอบเป็นตัวหนังสือนะ)`;
            aText = `นับจำนวน ${selectedEmoji} กันเถอะ มีทั้งหมดกี่ตัว ตอบเป็นตัวหนังสือนะ`;
          } else {
            correct = `${n} ตัว`;
            qText = `มีน้อง ${selectedEmoji} ยืนอยู่ทั้งหมดกี่ตัวนะ? (ตอบเป็นเลขฮินดูอารบิกนะเด็กๆ)`;
            aText = `มีน้อง ${selectedEmoji} ยืนอยู่ทั้งหมดกี่ตัวนะ ตอบเป็นเลขฮินดูอารบิกนะเด็กๆ`;
          }

          // สร้างตัวเลือก
          const wrongOpts = generateWrongOptions(n, format).map(opt => format === "text" ? opt : `${opt} ตัว`);
          const options = shuffleArray([correct, ...wrongOpts]);

          questions.push({
            id: `gen-count-choice-${i}-${Date.now()}`,
            type: "choice",
            questionText: qText,
            audioText: aText,
            imageEmoji: selectedEmoji,
            imageCount: n,
            options,
            correctAnswer: correct
          });
        } else {
          // โหมด Drag & Drop (จับคู่เลขไทยกับอารบิก)
          const n1 = Math.floor(Math.random() * 6); // 0-5
          const n2 = 6 + Math.floor(Math.random() * 5); // 6-10

          questions.push({
            id: `gen-count-drag-${i}-${Date.now()}`,
            type: "dragdrop",
            questionText: "ลากตัวเลขฮินดูอารบิกด้านล่าง มาจับคู่กับตัวเลขไทยให้ถูกต้องนะจ๊ะ",
            audioText: "ลากตัวเลขฮินดูอารบิกด้านล่าง มาจับคู่กับตัวเลขไทยให้ถูกต้องนะจ๊ะ",
            dragItems: shuffleArray([String(n1), String(n2), String(Math.floor(Math.random() * 11))]), // มีตัวลวง
            dropSlots: [
              { label: `เลขไทย ${toThaiNum(n1)} ตรงกับเลขใด: `, answer: String(n1) },
              { label: `เลขไทย ${toThaiNum(n2)} ตรงกับเลขใด: `, answer: String(n2) }
            ]
          });
        }
      } else if (subTopic === 1) {
        // หัวข้อ 2: การเปรียบเทียบจำนวน
        const isWordCompare = Math.random() > 0.5; // เปรียบเทียบภาพ หรือ เปรียบเทียบตัวหนังสือ
        const n1 = Math.floor(Math.random() * 11);
        const n2 = Math.floor(Math.random() * 11);

        let correctAns = "เท่ากับ ( = )";
        let textAnswer = "เท่ากัน";
        if (n1 > n2) {
          correctAns = "มากกว่า ( > )";
          textAnswer = "มากกว่า";
        } else if (n1 < n2) {
          correctAns = "น้อยกว่า ( < )";
          textAnswer = "น้อยกว่า";
        }

        if (!isWordCompare) {
          // เปรียบเทียบรูปภาพนับจำนวน
          questions.push({
            id: `gen-comp-pic-${i}-${Date.now()}`,
            type: "choice",
            questionText: `เปรียบเทียบจำนวน: ฝั่งซ้ายมี ${emojis[0]} และฝั่งขวามี ${emojis[1]} มีจำนวนอย่างไรกัน?`,
            audioText: `เปรียบเทียบจำนวน ฝั่งซ้ายมี ${toThaiText(n1)} ตัว และฝั่งขวามี ${toThaiText(n2)} ตัว มีจำนวนอย่างไรกัน`,
            leftEmoji: emojis[0],
            leftCount: n1,
            rightEmoji: emojis[1],
            rightCount: n2,
            options: ["มากกว่า ( > )", "น้อยกว่า ( < )", "เท่ากับ ( = )"],
            correctAnswer: correctAns
          });
        } else {
          // เปรียบเทียบตัวหนังสือไทย
          questions.push({
            id: `gen-comp-word-${i}-${Date.now()}`,
            type: "choice",
            questionText: `เปรียบเทียบคำว่า: '${toThaiText(n1)}' มีค่าตัวเลขเป็นอย่างไรเมื่อเทียบกับคำว่า '${toThaiText(n2)}'?`,
            audioText: `เปรียบเทียบคำว่า ${toThaiText(n1)} มีค่าตัวเลขเป็นอย่างไรเมื่อเทียบกับคำว่า ${toThaiText(n2)}`,
            options: ["มากกว่า", "น้อยกว่า", "เท่ากัน"],
            correctAnswer: textAnswer
          });
        }
      } else {
        // หัวข้อ 3: การเรียงลำดับจำนวน
        const size = Math.random() > 0.5 ? 3 : 4; // เรียงลำดับ 3 หรือ 4 ตัวเลข
        const isAscending = Math.random() > 0.5; // น้อยไปมาก หรือ มากไปน้อย
        const isThaiNum = Math.random() > 0.6; // สุ่มใช้เลขไทย

        // สุ่มตัวเลขไม่ซ้ำกัน
        const numsSet = new Set<number>();
        while (numsSet.size < size) {
          numsSet.add(Math.floor(Math.random() * 11));
        }
        const unsorted = Array.from(numsSet);
        
        // คำนวณการเรียงลำดับคำตอบที่ถูกต้อง
        const sorted = [...unsorted].sort((a, b) => isAscending ? a - b : b - a);

        const dragItems = shuffleArray(unsorted.map(n => isThaiNum ? toThaiNum(n) : String(n)));
        const dropSlots = sorted.map((n, idx) => {
          let label = "";
          if (idx === 0) label = isAscending ? "ตัวที่ 1 (น้อยสุด): " : "ตัวที่ 1 (มากสุด): ";
          else if (idx === sorted.length - 1) label = isAscending ? "ตัวสุดท้าย (มากสุด): " : "ตัวสุดท้าย (น้อยสุด): ";
          else label = `ตัวที่ ${idx + 1}: `;
          
          return {
            label,
            answer: isThaiNum ? toThaiNum(n) : String(n)
          };
        });

        const qText = `เรียงลำดับตัวเลข: ${unsorted.map(n => isThaiNum ? toThaiNum(n) : String(n)).join(", ")} จาก ${isAscending ? "น้อยที่สุด ไปหา มากที่สุด" : "มากที่สุด ไปหา น้อยที่สุด"} ให้ถูกต้องนะจ๊ะ`;
        const aText = `เรียงลำดับตัวเลข จาก ${isAscending ? "น้อยที่สุด ไปหา มากที่สุด" : "มากที่สุด ไปหา น้อยที่สุด"} ให้ถูกต้องนะจ๊ะ`;

        questions.push({
          id: `gen-order-${i}-${Date.now()}`,
          type: "dragdrop",
          questionText: qText,
          audioText: aText,
          dragItems,
          dropSlots
        });
      }
    } else if (chapterId === "addition") {
      // -----------------------------------------------------------------------
      // บทที่ 2: การบวกจำนวนสองจำนวนที่ผลบวกไม่เกิน 10
      // -----------------------------------------------------------------------
      const subTopic = i % 5;
      const emojis = getRandomEmojis(3);
      
      if (subTopic === 0) {
        // 1. การบวกด้วยภาพ
        const a = 1 + Math.floor(Math.random() * 5); // 1-5
        const b = 1 + Math.floor(Math.random() * 5); // 1-5
        const result = a + b; // ผลรวมสูงสุด 10
        const correct = `${result} ชิ้น`;
        const wrongOpts = generateWrongOptions(result, "arabic").map(opt => `${opt} ชิ้น`);
        const options = shuffleArray([correct, ...wrongOpts]);

        questions.push({
          id: `gen-add-img-${i}-${Date.now()}`,
          type: "choice",
          questionText: `การบวกด้วยภาพ: มี ${emojis[0]} ฝั่งซ้าย และฝั่งขวา จะรวมมีทั้งหมดกี่ชิ้น?`,
          audioText: `การบวกด้วยภาพ มี ${toThaiText(emojis[0] === "🍏" || emojis[0] === "🍎" ? 0 : 1)} ฝั่งซ้าย ${toThaiText(a)} ชิ้น รวมกับฝั่งขวา ${toThaiText(b)} ชิ้น จะรวมมีทั้งหมดกี่ชิ้น`,
          leftEmoji: emojis[0],
          leftCount: a,
          rightEmoji: emojis[0],
          rightCount: b,
          options,
          correctAnswer: correct
        });
      } else if (subTopic === 1) {
        // 2. การหาผลบวก (สุ่มหาตัวตั้ง ตัวบวก หรือผลลัพธ์)
        const result = Math.floor(Math.random() * 11); // 0-10
        const a = Math.floor(Math.random() * (result + 1));
        const b = result - a;
        
        const type = Math.floor(Math.random() * 3); // 0: A+B=?, 1: A+?=C, 2: ?+B=C
        const correct = String(type === 0 ? result : type === 1 ? b : a);
        const wrongOpts = generateWrongOptions(Number(correct), "arabic");
        const options = shuffleArray([correct, ...wrongOpts]);

        let qText = "";
        let aText = "";

        if (type === 0) {
          qText = `ประโยคสัญลักษณ์: ${a} + ${b} = ? ตัวเลขในเครื่องหมายคำถามคือเลขใด?`;
          aText = `${a} บวก ${b} เท่ากับเท่าไหร่ครับเด็กๆ`;
        } else if (type === 1) {
          qText = `ประโยคสัญลักษณ์: ${a} + ? = ${result} ตัวเลขในเครื่องหมายคำถามคือเลขใด?`;
          aText = `${a} บวกอะไรแล้วได้ ${result} ครับ`;
        } else {
          qText = `ประโยคสัญลักษณ์: ? + ${b} = ${result} ตัวเลขในเครื่องหมายคำถามคือเลขใด?`;
          aText = `อะไรบวกกับ ${b} แล้วได้ ${result} ครับ`;
        }

        questions.push({
          id: `gen-add-find-${i}-${Date.now()}`,
          type: "choice",
          questionText: qText,
          audioText: aText,
          options,
          correctAnswer: correct
        });
      } else if (subTopic === 2) {
        // 3. การบวกที่ผลบวกเป็น 10
        const a = Math.floor(Math.random() * 11); // 0-10
        const b = 10 - a;
        
        const isThai = Math.random() > 0.5;
        const correct = isThai ? toThaiNum(b) : String(b);
        const wrongOpts = generateWrongOptions(b, isThai ? "thai" : "arabic");
        const options = shuffleArray([correct, ...wrongOpts]);

        const showA = isThai ? toThaiNum(a) : String(a);
        const qText = `การบวกคู่สิบ: ตัวเลขใดที่บวกกับ ${showA} แล้วมีผลลัพธ์เท่ากับ 10 เสมอ?`;
        const aText = `ตัวเลขใดที่บวกกับ ${toThaiText(a)} แล้วมีผลลัพธ์เท่ากับสิบเสมอครับ`;

        questions.push({
          id: `gen-add-ten-${i}-${Date.now()}`,
          type: "choice",
          questionText: qText,
          audioText: aText,
          options,
          correctAnswer: correct
        });
      } else if (subTopic === 3) {
        // 4. ความสัมพันธ์ของจำนวนแบบส่วนย่อย-ส่วนรวมกับการบวก
        const result = 2 + Math.floor(Math.random() * 9); // 2-10 (ส่วนรวม)
        const a = 1 + Math.floor(Math.random() * (result - 1)); // ส่วนย่อยตัวแรก
        const b = result - a; // ส่วนย่อยตัวที่สอง

        questions.push({
          id: `gen-add-partwhole-${i}-${Date.now()}`,
          type: "dragdrop",
          questionText: `ความสัมพันธ์ส่วนย่อย-ส่วนรวม: ส่วนรวมคือ ${result} และถ้าแบ่งเป็นส่วนย่อยคือ ${a} กับอีกช่องหนึ่ง ตัวเลขในช่องที่หายไปคืออะไรนะ?`,
          audioText: `ส่วนรวมคือ ${toThaiText(result)} และถ้าแบ่งเป็นส่วนย่อยคือ ${toThaiText(a)} ตัวเลขในส่วนย่อยอีกช่องคือเลขใด`,
          dragItems: shuffleArray([String(b), String(Math.floor(Math.random() * 11)), String(Math.floor(Math.random() * 11))]),
          dropSlots: [
            { label: `ส่วนย่อยที่หายไปของส่วนรวม ${result} (คือ ${a} บวกอะไรได้ ${result}): `, answer: String(b) }
          ]
        });
      } else {
        // 5. โจทย์ปัญหาการบวก
        const result = 3 + Math.floor(Math.random() * 8); // 3-10
        const a = 1 + Math.floor(Math.random() * (result - 2));
        const b = result - a;

        const stories = [
          {
            q: `พี่หมีมีส้ม ${a} ผล แม่ให้อีก ${b} ผล รวมแล้วพี่หมีมีส้มทั้งหมดกี่ผล?`,
            sound: `พี่หมีมีส้ม ${toThaiText(a)} ผล แม่ให้อีก ${toThaiText(b)} ผล รวมแล้วพี่หมีมีส้มทั้งหมดกี่ผล`,
            unit: "ผล"
          },
          {
            q: `ในสระน้ำมีเป็ดว่ายน้ำอยู่ ${a} ตัว ลูกเป็ดกระโดดลงไปเพิ่มอีก ${b} ตัว รวมมีเป็ดกี่ตัว?`,
            sound: `ในสระน้ำมีเป็ดว่ายน้ำอยู่ ${toThaiText(a)} ตัว ลูกเป็ดกระโดดลงไปเพิ่มอีก ${toThaiText(b)} ตัว รวมมีเป็ดกี่ตัว`,
            unit: "ตัว"
          },
          {
            q: `น้องโบว์มีลูกโป่งสีแดง ${a} ลูก ลูกโป่งสีฟ้า ${b} ลูก รวมมีลูกโป่งทั้งหมดกี่ลูก?`,
            sound: `น้องโบว์มีลูกโป่งสีแดง ${toThaiText(a)} ลูก ลูกโป่งสีฟ้า ${toThaiText(b)} ลูก รวมมีลูกโป่งทั้งหมดกี่ลูก`,
            unit: "ลูก"
          }
        ];
        const story = stories[Math.floor(Math.random() * stories.length)];
        const correct = `${result} ${story.unit}`;
        const wrongOpts = generateWrongOptions(result, "arabic").map(opt => `${opt} ${story.unit}`);
        const options = shuffleArray([correct, ...wrongOpts]);

        questions.push({
          id: `gen-add-problem-${i}-${Date.now()}`,
          type: "choice",
          questionText: story.q,
          audioText: story.sound,
          options,
          correctAnswer: correct
        });
      }
    } else if (chapterId === "subtraction") {
      // -----------------------------------------------------------------------
      // บทที่ 3: การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10
      // -----------------------------------------------------------------------
      const subTopic = i % 5;
      const emojis = getRandomEmojis(3);

      if (subTopic === 0) {
        // 1. การลบด้วยภาพ
        const a = 3 + Math.floor(Math.random() * 8); // ตัวตั้ง 3-10
        const b = 1 + Math.floor(Math.random() * (a - 1)); // ตัวลบ 1 ถึง a-1
        const result = a - b;

        const correct = `${result} ชิ้น`;
        const wrongOpts = generateWrongOptions(result, "arabic").map(opt => `${opt} ชิ้น`);
        const options = shuffleArray([correct, ...wrongOpts]);

        questions.push({
          id: `gen-sub-img-${i}-${Date.now()}`,
          type: "choice",
          questionText: `การลบด้วยภาพ: มีขนม ${emojis[0]} ทั้งหมด ${a} ชิ้น หนูแบ่งให้เพื่อนไป ${b} ชิ้น จะเหลือขนมกี่ชิ้น?`,
          audioText: `การลบด้วยภาพ มีขนม ${toThaiText(a)} ชิ้น หนูแบ่งให้เพื่อนไป ${toThaiText(b)} ชิ้น จะเหลือขนมกี่ชิ้น`,
          leftEmoji: emojis[0],
          leftCount: a,
          rightEmoji: emojis[0],
          rightCount: b,
          options,
          correctAnswer: correct
        });
      } else if (subTopic === 1) {
        // 2. การหาผลลบ
        const a = 1 + Math.floor(Math.random() * 10); // ตัวตั้ง 1-10
        const b = Math.floor(Math.random() * (a + 1)); // ตัวลบ 0 ถึง a
        const result = a - b;

        const type = Math.random() > 0.5 ? 0 : 1; // 0: A-B=?, 1: A-?=C
        const correct = String(type === 0 ? result : b);
        const wrongOpts = generateWrongOptions(Number(correct), "arabic");
        const options = shuffleArray([correct, ...wrongOpts]);

        let qText = "";
        let aText = "";

        if (type === 0) {
          qText = `หาผลลบของประโยคสัญลักษณ์: ${a} - ${b} = ? ตัวเลขในเครื่องหมายคำถามคือเลขใด?`;
          aText = `${a} ลบด้วย ${b} เท่ากับเท่าไหร่ครับเด็กๆ`;
        } else {
          qText = `หาตัวเลขมาเติมในช่องว่าง: ${a} - ? = ${result} ตัวเลขในเครื่องหมายคำถามคือเลขใด?`;
          aText = `${a} ลบอะไรแล้วได้ ${result} ครับ`;
        }

        questions.push({
          id: `gen-sub-find-${i}-${Date.now()}`,
          type: "choice",
          questionText: qText,
          audioText: aText,
          options,
          correctAnswer: correct
        });
      } else if (subTopic === 2) {
        // 3. การลบโดยการเปรียบเทียบ
        const a = 5 + Math.floor(Math.random() * 6); // 5-10
        const b = 1 + Math.floor(Math.random() * (a - 2)); // 1 to a-2
        const diff = a - b;

        const items = [
          { q: `มีลูกโป่งสีฟ้า ${a} ลูก ลูกโป่งสีแดง ${b} ลูก มีลูกโป่งสีฟ้ามากกว่าลูกโป่งสีแดงกี่ลูก?`, sound: `มีลูกโป่งสีฟ้า ${toThaiText(a)} ลูก ลูกโป่งสีแดง ${toThaiText(b)} ลูก มีลูกโป่งสีฟ้ามากกว่าลูกโป่งสีแดงกี่ลูก` },
          { q: `มีดินสอ ${a} แท่ง มียางลบ ${b} ก้อน มียางลบน้อยกว่าดินสอกี่ชิ้น?`, sound: `มีดินสอ ${toThaiText(a)} แท่ง มียางลบ ${toThaiText(b)} ก้อน มียางลบน้อยกว่าดินสอกี่ชิ้น` }
        ];
        const item = items[Math.floor(Math.random() * items.length)];
        const finalUnit = item.q.includes("ลูกโป่ง") ? "ลูก" : "แท่ง";
        const finalCorrect = `${diff} ${finalUnit}`;
        const wrongOpts = generateWrongOptions(diff, "arabic").map(opt => `${opt} ${finalUnit}`);
        const options = shuffleArray([finalCorrect, ...wrongOpts]);

        const isBalloon = item.q.includes("ลูกโป่ง");
        const leftIcon = isBalloon ? "🔵" : "✏️";
        const rightIcon = isBalloon ? "🔴" : "🧼";

        questions.push({
          id: `gen-sub-comp-${i}-${Date.now()}`,
          type: "choice",
          questionText: item.q,
          audioText: item.sound,
          leftEmoji: leftIcon,
          leftCount: a,
          rightEmoji: rightIcon,
          rightCount: b,
          options,
          correctAnswer: finalCorrect
        });
      } else if (subTopic === 3) {
        // 4. ความสัมพันธ์ส่วนย่อย-ส่วนรวมกับการลบ
        const result = 3 + Math.floor(Math.random() * 8); // 3-10 (ส่วนรวม)
        const a = 1 + Math.floor(Math.random() * (result - 2)); // ส่วนย่อยแรก
        const b = result - a;

        questions.push({
          id: `gen-sub-partwhole-${i}-${Date.now()}`,
          type: "dragdrop",
          questionText: `ความสัมพันธ์ส่วนย่อย-ส่วนรวมกับการลบ: มีสิ่งของทั้งหมด ${result} ชิ้น (ส่วนรวม) หักออกเป็นส่วนย่อยกลุ่มที่หนึ่ง ${a} ชิ้น จะเหลือส่วนย่อยกลุ่มที่สองกี่ชิ้น?`,
          audioText: `มีสิ่งของทั้งหมด ${toThaiText(result)} ชิ้น หักออกเป็นส่วนย่อยกลุ่มแรก ${toThaiText(a)} ชิ้น จะเหลือส่วนย่อยอีกกลุ่มกี่ชิ้น`,
          dragItems: shuffleArray([String(b), String(Math.floor(Math.random() * 11)), String(Math.floor(Math.random() * 11))]),
          dropSlots: [
            { label: `ส่วนย่อยกลุ่มที่สองที่เหลือจากการลบ (${result} ลบ ${a}): `, answer: String(b) }
          ]
        });
      } else {
        // 5. โจทย์ปัญหาการลบ
        const a = 4 + Math.floor(Math.random() * 7); // ตัวตั้ง 4-10
        const b = 1 + Math.floor(Math.random() * (a - 1)); // ตัวลบ 1 ถึง a-1
        const result = a - b;

        const stories = [
          {
            q: `น้องพลอยมีขนมเค้ก ${a} ชิ้น แบ่งให้น้องกินไป ${b} ชิ้น น้องพลอยจะเหลือขนมเค้กกี่ชิ้น?`,
            sound: `น้องพลอยมีขนมเค้ก ${toThaiText(a)} ชิ้น แบ่งให้น้องกินไป ${toThaiText(b)} ชิ้น น้องพลอยจะเหลือขนมเค้กกี่ชิ้น`,
            unit: "ชิ้น"
          },
          {
            q: `มีนกเกาะอยู่บนกิ่งไม้ ${a} ตัว บินหนีไป ${b} ตัว จะเหลือคู่เกาะอยู่กี่ตัว?`,
            sound: `มีนกเกาะอยู่บนกิ่งไม้ ${toThaiText(a)} ตัว บินหนีไป ${toThaiText(b)} ตัว จะเหลือคู่เกาะอยู่กี่ตัว`,
            unit: "ตัว"
          },
          {
            q: `กัปตันมีเงิน ${a} บาท ซื้อของเล่นไป ${b} บาท กัปตันจะเหลือเงินกี่บาท?`,
            sound: `กัปตันมีเงิน ${toThaiText(a)} บาท ซื้อของเล่นไป ${toThaiText(b)} บาท กัปตันจะเหลือเงินกี่บาท`,
            unit: "บาท"
          }
        ];
        const story = stories[Math.floor(Math.random() * stories.length)];
        const correct = `${result} ${story.unit}`;
        const wrongOpts = generateWrongOptions(result, "arabic").map(opt => `${opt} ${story.unit}`);
        const options = shuffleArray([correct, ...wrongOpts]);

        questions.push({
          id: `gen-sub-problem-${i}-${Date.now()}`,
          type: "choice",
          questionText: story.q,
          audioText: story.sound,
          options,
          correctAnswer: correct
        });
      }
    }
  }

  return questions;
}
