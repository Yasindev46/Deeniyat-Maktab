// MongoDB seed data exported from server/database.db.
// Run with mongosh using the target database in the connection URI.

db.students.createIndex({ sr: 1 }, { unique: true });
db.attendance_records.createIndex({ student_id: 1, date: 1 }, { unique: true });
db.fees_records.createIndex({ student_id: 1 }, { unique: true });
db.expenses_records.createIndex({ id: 1 }, { unique: true });

db.students.insertMany(
[
  {
    "id": 1,
    "sr": "25/001",
    "name": "Arishafa Kasim Ansari",
    "class": "0",
    "mobile": "7028483245"
  },
  {
    "id": 2,
    "sr": "25/002",
    "name": "Adnanhusain Abdulhameed Sindgikar",
    "class": "0",
    "mobile": "8660446755"
  },
  {
    "id": 3,
    "sr": "25/003",
    "name": "Aaliya Yasin Mulla",
    "class": "0",
    "mobile": "9545786450"
  },
  {
    "id": 4,
    "sr": "25/004",
    "name": "Mohammad Saad Mohammad Umair",
    "class": "0",
    "mobile": "8459734656"
  },
  {
    "id": 5,
    "sr": "25/005",
    "name": "Farhaan Faiyaz Mulla",
    "class": "0",
    "mobile": "9920305196"
  },
  {
    "id": 6,
    "sr": "25/006",
    "name": "Sayyad Rajesab Choragasti",
    "class": "0",
    "mobile": "8123792103"
  },
  {
    "id": 7,
    "sr": "25/007",
    "name": "Maahira Mustafa Shaikh",
    "class": "0",
    "mobile": "9021406090"
  },
  {
    "id": 8,
    "sr": "25/008",
    "name": "Aliza Mohshim Mujawar",
    "class": "0",
    "mobile": "7972563460"
  },
  {
    "id": 9,
    "sr": "25/009",
    "name": "Arham Khurshid Shaikh",
    "class": "0",
    "mobile": "8530271612"
  },
  {
    "id": 10,
    "sr": "25/010",
    "name": "Anabiya H. Anzar Kureshi",
    "class": "0",
    "mobile": "9764672725"
  },
  {
    "id": 11,
    "sr": "25/011",
    "name": "Madiha Rafiq Shaikh",
    "class": "0",
    "mobile": "914626007"
  },
  {
    "id": 12,
    "sr": "25/012",
    "name": "Zaid Zamal Khan",
    "class": "0",
    "mobile": "9168183612"
  },
  {
    "id": 13,
    "sr": "25/013",
    "name": "Yasin Samir Makapure",
    "class": "0",
    "mobile": "9850763334"
  },
  {
    "id": 14,
    "sr": "25/014",
    "name": "Zunaira Jiyaul Khan",
    "class": "0",
    "mobile": "9623915103"
  },
  {
    "id": 15,
    "sr": "25/015",
    "name": "Zohan Nizamuddin Inmadar",
    "class": "0",
    "mobile": "9175856358"
  },
  {
    "id": 16,
    "sr": "25/016",
    "name": "Zara Dastgir Pathan",
    "class": "0",
    "mobile": "9637544184"
  },
  {
    "id": 17,
    "sr": "25/017",
    "name": "Irfan Riyaz Shaikh",
    "class": "0",
    "mobile": "8766796636"
  },
  {
    "id": 18,
    "sr": "25/018",
    "name": "Altaf Saddam Sayyad",
    "class": "0",
    "mobile": "9689334175"
  },
  {
    "id": 19,
    "sr": "25/019",
    "name": "Khan Usman Ajazulla",
    "class": "0",
    "mobile": "9595967609"
  },
  {
    "id": 20,
    "sr": "25/020",
    "name": "Zohaan Minaj Ullah Khan Pathan",
    "class": "0",
    "mobile": "9890566500"
  },
  {
    "id": 21,
    "sr": "25/021",
    "name": "Leeza Jafar Sayyad",
    "class": "0",
    "mobile": "9822352734"
  },
  {
    "id": 22,
    "sr": "25/022",
    "name": "Usman Rahim Shaikh",
    "class": "0",
    "mobile": "7666886308"
  },
  {
    "id": 23,
    "sr": "25/023",
    "name": "Mohammad Faisal Matiurraheman",
    "class": "1 A",
    "mobile": "9552701445"
  },
  {
    "id": 24,
    "sr": "25/024",
    "name": "Sarifali Modladdm Ali",
    "class": "1 A",
    "mobile": "9082357213"
  },
  {
    "id": 25,
    "sr": "25/025",
    "name": "Mayara Rafik Pathan",
    "class": "1 A",
    "mobile": "8421486003"
  },
  {
    "id": 26,
    "sr": "25/026",
    "name": "Zainab Ayub Tamboil",
    "class": "1 A",
    "mobile": "7972795661"
  },
  {
    "id": 27,
    "sr": "25/027",
    "name": "Ruhan Faruk Sayyad",
    "class": "1 A",
    "mobile": "9637121237"
  },
  {
    "id": 28,
    "sr": "25/028",
    "name": "Afshan Dastgir Shanediwan",
    "class": "1 A",
    "mobile": "8007979712"
  },
  {
    "id": 29,
    "sr": "25/029",
    "name": "Amaira Nasir Khan",
    "class": "1 A",
    "mobile": "9730543894"
  },
  {
    "id": 30,
    "sr": "25/030",
    "name": "Affan Mohsin Shaikh",
    "class": "1 A",
    "mobile": "7350300696"
  },
  {
    "id": 31,
    "sr": "25/031",
    "name": "Aleem Riyaz Shaikh",
    "class": "1 A",
    "mobile": "8766796636"
  },
  {
    "id": 32,
    "sr": "25/032",
    "name": "Hasan Dawood Patel",
    "class": "1 A",
    "mobile": "8177873684"
  },
  {
    "id": 33,
    "sr": "25/033",
    "name": "Ayasha Mohammad Pathan",
    "class": "1 A",
    "mobile": "7038480845"
  },
  {
    "id": 34,
    "sr": "25/034",
    "name": "Md. Alfaz Ameer Bagyat",
    "class": "1 A",
    "mobile": "7666384870"
  },
  {
    "id": 35,
    "sr": "25/035",
    "name": "Ayesha Rahim Shaikh",
    "class": "1 A",
    "mobile": "7666886308"
  },
  {
    "id": 36,
    "sr": "25/036",
    "name": "Samad Sikandar Shaikh",
    "class": "1 B",
    "mobile": "9172818791"
  },
  {
    "id": 37,
    "sr": "25/037",
    "name": "Mohammad Musab Mohammad Umair",
    "class": "1 B",
    "mobile": "8459734656"
  },
  {
    "id": 38,
    "sr": "25/038",
    "name": "Aayesha Yasin Mulla",
    "class": "1 B",
    "mobile": "9545786450"
  },
  {
    "id": 39,
    "sr": "25/039",
    "name": "Zainab Shakut Kotwal",
    "class": "1 B",
    "mobile": "9850250886"
  },
  {
    "id": 40,
    "sr": "25/040",
    "name": "Madiha Jamir Tamboli",
    "class": "1 B",
    "mobile": "9373422676"
  },
  {
    "id": 41,
    "sr": "25/041",
    "name": "Arham Wasim Khan",
    "class": "1 B",
    "mobile": "9028602952"
  },
  {
    "id": 42,
    "sr": "25/042",
    "name": "Aayat Salim Khan",
    "class": "1 B",
    "mobile": "9359398396"
  },
  {
    "id": 43,
    "sr": "25/043",
    "name": "Affan Shakil Ahmed",
    "class": "1 B",
    "mobile": "7353173161"
  },
  {
    "id": 44,
    "sr": "25/044",
    "name": "Salman Shakil Ahmed",
    "class": "1 B",
    "mobile": "7353173161"
  },
  {
    "id": 45,
    "sr": "25/045",
    "name": "Saifan Shakil Ahmed",
    "class": "1 B",
    "mobile": "7353173161"
  },
  {
    "id": 46,
    "sr": "25/046",
    "name": "Mohammad Zaid Jiyaul Khan",
    "class": "1 B",
    "mobile": "9623915103"
  },
  {
    "id": 47,
    "sr": "25/047",
    "name": "Arsh Mohsin Thanage",
    "class": "1 B",
    "mobile": "9834798455"
  },
  {
    "id": 48,
    "sr": "25/048",
    "name": "Sumaiya Anis Ansari",
    "class": "1 B",
    "mobile": "8698636739"
  },
  {
    "id": 49,
    "sr": "25/049",
    "name": "Faruk Javed Mulla",
    "class": "1 B",
    "mobile": "9021528772"
  },
  {
    "id": 50,
    "sr": "25/050",
    "name": "Minsa Samir Makapure",
    "class": "1 B",
    "mobile": "8007775455"
  },
  {
    "id": 51,
    "sr": "25/051",
    "name": "Mohmmad Abusalim Mohmmad Vasim",
    "class": "2 A",
    "mobile": "7057786902"
  },
  {
    "id": 52,
    "sr": "25/052",
    "name": "Abubakar Siraj Nadaf",
    "class": "2 A",
    "mobile": "7559213251"
  },
  {
    "id": 53,
    "sr": "25/053",
    "name": "Umar Ajaj Nadaf",
    "class": "2 A",
    "mobile": "9623473337"
  },
  {
    "id": 54,
    "sr": "25/054",
    "name": "Rihan Rafiq Dafedaar",
    "class": "2 A",
    "mobile": "8618775626"
  },
  {
    "id": 55,
    "sr": "25/055",
    "name": "Asad Rafiq Dafedaar",
    "class": "2 A",
    "mobile": "8618775626"
  },
  {
    "id": 56,
    "sr": "25/056",
    "name": "Shish Amjad Hashmi",
    "class": "2 A",
    "mobile": "9158669987"
  },
  {
    "id": 57,
    "sr": "25/057",
    "name": "Taimur Amir Mulani",
    "class": "2 A",
    "mobile": "9356597687"
  },
  {
    "id": 58,
    "sr": "25/058",
    "name": "Arsalan Anwar Pathan",
    "class": "2 A",
    "mobile": "9975418532"
  },
  {
    "id": 59,
    "sr": "25/059",
    "name": "Faran Javed Mulla",
    "class": "2 A",
    "mobile": "9021528772"
  },
  {
    "id": 60,
    "sr": "25/060",
    "name": "Ariz Shaikh Asim Shaikh",
    "class": "2 A",
    "mobile": "9850514653"
  },
  {
    "id": 61,
    "sr": "25/061",
    "name": "Mizan Jamir Tamboli",
    "class": "2 A",
    "mobile": "9373422676"
  },
  {
    "id": 62,
    "sr": "25/062",
    "name": "Doulmalik Allabaksh Mujawar",
    "class": "2 A",
    "mobile": "9819084596"
  },
  {
    "id": 63,
    "sr": "25/063",
    "name": "Mubashshera Talha Mohammad",
    "class": "2 A",
    "mobile": "7058693504"
  },
  {
    "id": 64,
    "sr": "25/064",
    "name": "Sufiyan Ahamad Shaikh",
    "class": "2 A",
    "mobile": "9529332154"
  },
  {
    "id": 65,
    "sr": "25/065",
    "name": "Ajhar Jamir Khan",
    "class": "2 A",
    "mobile": "9527861213"
  },
  {
    "id": 66,
    "sr": "25/066",
    "name": "Salman Salim Shaikh",
    "class": "2 A",
    "mobile": "9890237459"
  },
  {
    "id": 67,
    "sr": "25/067",
    "name": "Abdullah Arshad Siddiqui",
    "class": "2 A",
    "mobile": "8668684805"
  },
  {
    "id": 68,
    "sr": "25/068",
    "name": "Rehan Salim Shaikh",
    "class": "2 A",
    "mobile": "9890237459"
  },
  {
    "id": 69,
    "sr": "25/069",
    "name": "Ayyub Shaukat Kotwal",
    "class": "2 A",
    "mobile": "9850250886"
  },
  {
    "id": 70,
    "sr": "25/070",
    "name": "Sultan Salim Shaikh",
    "class": "2 A",
    "mobile": "9890237459"
  },
  {
    "id": 71,
    "sr": "25/071",
    "name": "Tanveer Naeem Ansari",
    "class": "2 A",
    "mobile": "9049460339"
  },
  {
    "id": 72,
    "sr": "25/072",
    "name": "Taherim Kausar Matiurraheman",
    "class": "2 B",
    "mobile": "9552701445"
  },
  {
    "id": 73,
    "sr": "25/073",
    "name": "Uzair Alam Shaikh",
    "class": "2 B",
    "mobile": "9764120453"
  },
  {
    "id": 74,
    "sr": "25/074",
    "name": "Azeem Riyaz Shaikh",
    "class": "2 B",
    "mobile": "8766796637"
  },
  {
    "id": 75,
    "sr": "25/075",
    "name": "Arshiya Tajjudin Pathan",
    "class": "2 B",
    "mobile": "9970412131"
  },
  {
    "id": 76,
    "sr": "25/076",
    "name": "Asharb Mohammad Pathan",
    "class": "2 B",
    "mobile": "7038480845"
  },
  {
    "id": 77,
    "sr": "25/077",
    "name": "Aamina Faheem Shaikh",
    "class": "2 B",
    "mobile": "9665589777"
  },
  {
    "id": 78,
    "sr": "25/078",
    "name": "AfiyaDastgir Shanediwan",
    "class": "2 B",
    "mobile": "8007979712"
  },
  {
    "id": 79,
    "sr": "25/079",
    "name": "Aalfiya Zannat Md. Naeem Ansari",
    "class": "2 B",
    "mobile": "9049460339"
  },
  {
    "id": 80,
    "sr": "25/080",
    "name": "Sayba Mohd. Laddan",
    "class": "2 B",
    "mobile": "9082357213"
  },
  {
    "id": 81,
    "sr": "25/081",
    "name": "Asif ali Mohd. Laddan",
    "class": "2 B",
    "mobile": "9082357213"
  },
  {
    "id": 82,
    "sr": "25/082",
    "name": "Zara Kamir Khan",
    "class": "2 B",
    "mobile": "9665507004"
  },
  {
    "id": 83,
    "sr": "25/083",
    "name": "Arfa Rajesab Choragasti",
    "class": "2 B",
    "mobile": "8123792103"
  },
  {
    "id": 84,
    "sr": "25/084",
    "name": "Awej Jameer Sayyad",
    "class": "2 B",
    "mobile": "9881056974"
  },
  {
    "id": 85,
    "sr": "25/085",
    "name": "Mahin Jameer Sayyad",
    "class": "2 B",
    "mobile": "9881056974"
  },
  {
    "id": 86,
    "sr": "25/086",
    "name": "Shahzad Ayub Tamboli",
    "class": "2 B",
    "mobile": "7972795661"
  },
  {
    "id": 87,
    "sr": "25/087",
    "name": "Tohid Rafik Pathan",
    "class": "3 A",
    "mobile": "8421486003"
  },
  {
    "id": 88,
    "sr": "25/088",
    "name": "Jannat Siraj Nadaf",
    "class": "3 A",
    "mobile": "7559213251"
  },
  {
    "id": 89,
    "sr": "25/089",
    "name": "Atiq Mehboob Shaikh",
    "class": "3 A",
    "mobile": "7387974504"
  },
  {
    "id": 90,
    "sr": "25/090",
    "name": "Abbdul Samad Jamir Khan",
    "class": "3 A",
    "mobile": "9527861213"
  },
  {
    "id": 91,
    "sr": "25/091",
    "name": "Kaif  Khursheed Shaikh",
    "class": "3 A",
    "mobile": "8530271612"
  },
  {
    "id": 92,
    "sr": "25/092",
    "name": "Shahina Mohsin Thanage",
    "class": "3 A",
    "mobile": "9834798455"
  },
  {
    "id": 93,
    "sr": "25/093",
    "name": "Ayan Allauddin Shaikh",
    "class": "3 A",
    "mobile": "7385302430"
  },
  {
    "id": 94,
    "sr": "25/094",
    "name": "Alfaz Amir Mulani",
    "class": "3 A",
    "mobile": "9356597387"
  },
  {
    "id": 95,
    "sr": "25/095",
    "name": "Arshan Mohsin Fakir",
    "class": "3 A",
    "mobile": "9822352734"
  },
  {
    "id": 96,
    "sr": "25/096",
    "name": "Sohel Paigmbar Shaikh",
    "class": "3 A",
    "mobile": "7666384870"
  },
  {
    "id": 97,
    "sr": "25/097",
    "name": "Afzal Rahim Shaikh",
    "class": "3 A",
    "mobile": "7666886308"
  },
  {
    "id": 98,
    "sr": "25/098",
    "name": "Bushra Anjum Mohammad Umair",
    "class": "3 B",
    "mobile": "8459734656"
  },
  {
    "id": 99,
    "sr": "25/099",
    "name": "Aahil Allauddin Shaikh",
    "class": "3 B",
    "mobile": "7385302430"
  },
  {
    "id": 100,
    "sr": "25/100",
    "name": "Tofik Rafik Pathan",
    "class": "3 B",
    "mobile": "8421486003"
  },
  {
    "id": 101,
    "sr": "25/101",
    "name": "Fatima Shakil Nadaf",
    "class": "3 B",
    "mobile": "8055042711"
  },
  {
    "id": 102,
    "sr": "25/102",
    "name": "Aayat Shakil Nadaf",
    "class": "3 B",
    "mobile": "8055042711"
  },
  {
    "id": 103,
    "sr": "25/103",
    "name": "Fatima Faiyaz Mulla",
    "class": "3 B",
    "mobile": "9920305196"
  },
  {
    "id": 104,
    "sr": "25/104",
    "name": "Alif Ameer Bagayat",
    "class": "3 B",
    "mobile": "9146285494"
  },
  {
    "id": 105,
    "sr": "25/105",
    "name": "Shahin Kamir Khan",
    "class": "3 B",
    "mobile": "9665507004"
  },
  {
    "id": 106,
    "sr": "25/106",
    "name": "Sanaya Dastgir Pathan",
    "class": "3 B",
    "mobile": "9637544184"
  },
  {
    "id": 107,
    "sr": "25/107",
    "name": "Rida Rafiq Shaikh",
    "class": "3 B",
    "mobile": "9146260037"
  },
  {
    "id": 108,
    "sr": "25/108",
    "name": "Arhaan Afsar Bhaldaar",
    "class": "3 B",
    "mobile": "9657860061"
  },
  {
    "id": 109,
    "sr": "25/109",
    "name": "Abuzar Alam Shaikh",
    "class": "3 B",
    "mobile": "9764120453"
  },
  {
    "id": 110,
    "sr": "25/110",
    "name": "Arzan Javed Sutar",
    "class": "4 A",
    "mobile": "9922055313"
  },
  {
    "id": 111,
    "sr": "25/111",
    "name": "Izan Javed Sutar",
    "class": "4 A",
    "mobile": "9922055313"
  },
  {
    "id": 112,
    "sr": "25/112",
    "name": "Saba Sikandar Sayyad",
    "class": "4 A",
    "mobile": "9172818791"
  },
  {
    "id": 113,
    "sr": "25/113",
    "name": "Izaan Anwar Pathan",
    "class": "4 A",
    "mobile": "9975418532"
  },
  {
    "id": 114,
    "sr": "25/114",
    "name": "Arshin Yunus Mujawar",
    "class": "4 A",
    "mobile": "9822111405"
  },
  {
    "id": 115,
    "sr": "25/115",
    "name": "Mudassir Talha Mohammad",
    "class": "4 A",
    "mobile": "7058693504"
  },
  {
    "id": 116,
    "sr": "25/116",
    "name": "Ahad Jamir Khan",
    "class": "4 A",
    "mobile": "9527861213"
  },
  {
    "id": 117,
    "sr": "25/117",
    "name": "Kulsum Fatema Fayazullah Khan",
    "class": "4 A",
    "mobile": "9970052052"
  },
  {
    "id": 118,
    "sr": "25/118",
    "name": "Mahin Moshim Mujawar",
    "class": "4 A",
    "mobile": "7972563460"
  },
  {
    "id": 119,
    "sr": "25/119",
    "name": "Maheera Sameer Mulani",
    "class": "4 A",
    "mobile": "9970512070"
  },
  {
    "id": 120,
    "sr": "25/120",
    "name": "Sana Yakub Ansari",
    "class": "4 A",
    "mobile": "9373436478"
  },
  {
    "id": 121,
    "sr": "25/121",
    "name": "Mahin Dastgir Pathan",
    "class": "4 B",
    "mobile": "9637544184"
  },
  {
    "id": 122,
    "sr": "25/122",
    "name": "Fariha Rafiq Shaikh",
    "class": "4 B",
    "mobile": "9146260037"
  },
  {
    "id": 123,
    "sr": "25/123",
    "name": "Ifra Shakil Nadaf",
    "class": "4 B",
    "mobile": "8055042711"
  },
  {
    "id": 124,
    "sr": "25/124",
    "name": "Zunaid Imamuddin Inamdar",
    "class": "4 B",
    "mobile": "9373234390"
  },
  {
    "id": 125,
    "sr": "25/125",
    "name": "Arhaan Ahmad Shaikh",
    "class": "4 B",
    "mobile": "9765992215"
  },
  {
    "id": 126,
    "sr": "25/126",
    "name": "Faizal Mohammad Pathan",
    "class": "4 B",
    "mobile": "7038480845"
  },
  {
    "id": 127,
    "sr": "25/127",
    "name": "Pathan Umar Khan Irshad Khan",
    "class": "4 B",
    "mobile": "7028883777"
  },
  {
    "id": 128,
    "sr": "25/128",
    "name": "Noman Faruk Bagwan",
    "class": "4 B",
    "mobile": "7447243342"
  },
  {
    "id": 129,
    "sr": "25/129",
    "name": "Abuhamza Tanvir Shaikh",
    "class": "5",
    "mobile": "7875380786"
  },
  {
    "id": 130,
    "sr": "25/130",
    "name": "Sajad Rajak Shaikh",
    "class": "5",
    "mobile": "7720966076"
  },
  {
    "id": 131,
    "sr": "25/131",
    "name": "Samiya Anis Ansari",
    "class": "5",
    "mobile": "8698636739"
  },
  {
    "id": 132,
    "sr": "25/132",
    "name": "Sanam Firdos Shailkh Ayaz",
    "class": "5",
    "mobile": "7744855510"
  },
  {
    "id": 133,
    "sr": "25/133",
    "name": "Khan Arshan Ajazulla",
    "class": "5",
    "mobile": "9595967609"
  },
  {
    "id": 134,
    "sr": "25/134",
    "name": "Ayaan Jafar Sayyad",
    "class": "5",
    "mobile": "9822352734"
  },
  {
    "id": 135,
    "sr": "25/135",
    "name": "Ansari Mohd. Saad Mohd. Munawwar",
    "class": "6",
    "mobile": "8483085496"
  },
  {
    "id": 136,
    "sr": "25/136",
    "name": "Akif Zakir Shaikh",
    "class": "6",
    "mobile": "8087578684"
  },
  {
    "id": 137,
    "sr": "25/137",
    "name": "Sufiyan Faruk Bagwan",
    "class": "6",
    "mobile": "7447243342"
  }
]
);

db.attendance_records.insertMany(
[
  {
    "id": 1,
    "student_id": 23,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 2,
    "student_id": 24,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 3,
    "student_id": 25,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 4,
    "student_id": 26,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 5,
    "student_id": 27,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 6,
    "student_id": 28,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 7,
    "student_id": 29,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 15,
    "student_id": 1,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 16,
    "student_id": 2,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 17,
    "student_id": 3,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 18,
    "student_id": 4,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 19,
    "student_id": 5,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 20,
    "student_id": 6,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 21,
    "student_id": 7,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 22,
    "student_id": 8,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 23,
    "student_id": 9,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 24,
    "student_id": 10,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 25,
    "student_id": 11,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 26,
    "student_id": 12,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 27,
    "student_id": 13,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 28,
    "student_id": 14,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 29,
    "student_id": 15,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 30,
    "student_id": 16,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 31,
    "student_id": 17,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 32,
    "student_id": 18,
    "date": "2026-10-02",
    "status": "Absent"
  },
  {
    "id": 33,
    "student_id": 19,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 34,
    "student_id": 20,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 35,
    "student_id": 21,
    "date": "2026-10-02",
    "status": "Present"
  },
  {
    "id": 36,
    "student_id": 22,
    "date": "2026-10-02",
    "status": "Present"
  }
]
);

db.fees_records.insertMany(
[
  {
    "id": 1,
    "student_id": 1,
    "paid_amount": 50.0,
    "notes": "test"
  },
  {
    "id": 5,
    "student_id": 2,
    "paid_amount": 10.0,
    "notes": "Cash payment - 10 Oct 2026"
  }
]
);
db.expenses_records.insertMany(
[
  {
    "id": 1,
    "paid_amount": 50.0,
    "purpose": "test",
    "date": "2026-10-02"
  },
    {
    "id": 2,
    "paid_amount": 150.0,
    "purpose": "Salary payment - 10 Oct 2026",
    "date": "2026-10-02"
  },
]
);