import express from "express";
import PDF from "pdfkit";
import fs from 'fs';
import cors from 'cors';
import {colors} from '../styles/colors.js';
import { data } from "../mockData.js";

//A4 (595.28 x 841.89)
const generateRouter = express.Router();
const {black,white,green} = colors;
const margins = { top: 12, bottom: 12, left: 30, right: 30 };
const star = "•";
const headings = ["CAREER SUMMARY", "WORK EXPERIENCE"];

generateRouter.use(cors({
  origin:['http://192.168.0.103:3001','http://localhost:3001'],
  methods: ['GET']
}))

generateRouter.get("/", (req, res) => {
  try {
   const {careerSummary,highestQualification:highestQual,hobbies,skills,workExperience:content,details,awards} = data;
   const {mobile,name,email,linkedIn,location} = details;
    const pdf = new PDF({
      size: "A4",
      font: "Times-Roman",
      margins,
    });
    const spacing1 = margins.top + pdf.heightOfString(name) + 16;
    const spacing2 = spacing1 + 4 + pdf.heightOfString(headings[0]);
    const spacings = [spacing1, spacing2];
    
    pdf.registerFont("Heading Font", "fonts/TimesNewRomanBold.ttf");
    pdf.registerFont("Text Font", "fonts/TimesNewRoman.ttf");
    pdf.font("Heading Font", 16).text(name.toUpperCase(), { align: "center" });
  
    pdf
      .font("Text Font", 14)
      .text(headings[0], 194.184, spacings[0], { fill: black });
  
    pdf
      .font("Text Font", 10)
      .text(careerSummary, 194.184, spacings[1], { align: "justify" });
  
    spacings.push(spacings[1] + 4 + pdf.heightOfString(careerSummary));
  
    pdf.moveTo(194.184, spacings[2]).lineTo(579.28, spacings[2]).stroke();
  
    spacings.push(spacings[2] + 4);
    pdf
      .font("Text Font", 14)
      .text(headings[1], 194.184, spacings[3], { fill: black });
    spacings.push(spacings[3] + pdf.heightOfString(headings[1]));
  
    content.forEach((item, i) => {
      pdf
        .font("Heading Font", 12)
        .text(item.company, 194.184, spacings[spacings?.length - 1], {
          fill: black,
          continued: true,
        })
        .font("Text Font", 12)
        .text(item.location, 194.184, spacings[spacings?.length - 1], {
          align: "right",
          fill: black,
        });
      spacings.push(
        spacings[spacings?.length - 1] + pdf.heightOfString(item.company)
      );
  
      item["roles"].forEach((a, b) => {
        pdf
          .font("Heading Font", 12)
          .text(a.name, 194.184, spacings[spacings?.length - 1], {
            fill: black,
            continued: true,
          })
          .font("Text Font", 12)
          .text(a.period, 194.184, spacings[spacings?.length - 1], {
            fill: black,
            align: "right",
          });
        spacings.push(
          spacings[spacings?.length - 1] + pdf.heightOfString(a.name) + 4
        );
  
        a["description"].forEach((p, q) => {
          let { text, link } = p;
          let linkObj =
            link?.length > 0
              ? { link, align: "justify", underline: true }
              : undefined;
          pdf.text(star, 194.184, spacings[spacings?.length - 1], {
            baseline: "hanging",
          });
          pdf
            .font("Text Font", 10)
            .text(
              `${text}`,
              194.184 + pdf.widthOfString(star) + 4,
              spacings[spacings?.length - 1],
              {
                align: "justify",
                continued: true,
                baseline: "hanging",
              }
            )
            .text(`\n${link}`, linkObj);
          spacings.push(
            spacings[spacings?.length - 1] +
              pdf.heightOfString(a.description[q].text + `${a.description[q].link ? '\n' : ''}${a.description[q].link}`) +
              4
          );
        });
      });
    });
    pdf
      .moveTo(194.184, spacings[spacings?.length - 1])
      .lineTo(579.28, spacings[spacings?.length - 1])
      .stroke();
    
      pdf.font('Text Font',14).text('PERSONAL PROJECTS',194.184, spacings[spacings?.length - 1]+4)
      pdf.font('Text Font',10).text('Name : CV Builder',194.184, spacings[spacings?.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8)
      pdf.font('Text Font',10).text('About : A simple application that can be used to build CV\'s in PDF format',194.184, spacings[spacings?.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('Name : CV Builder')+2)
      //pdf.font('Text Font',10).text('Description : ',194.184, spacings[spacings?.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('Name : CV Builder')+2+pdf.heightOfString('About : A simple application that can be used to build CV\'s in PDF format')+2)
      pdf.font('Text Font',10).text('Framework : Express NodeJS for Backend',194.184, spacings[spacings?.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('Name : CV Builder')+2+pdf.heightOfString('About : A simple application that can be used to build CV\'s in PDF format')+2)
  
    pdf.rect(16, spacings[0], 170.184, 777.89).fill(green);
    pdf.image("images/Passport.jpg", 16, spacings[0] + 12, {
      fit: [170.184, 120],
      align: "center",
    });
    pdf
      .font("Heading Font", 12)
      .fillColor(white)
      .text("CONTACT", 16 + (170.184-(pdf.widthOfString("CONTACT")))/2, spacings[0] + 136);
      pdf.image("images/location.png", 32, spacings[0] + pdf.heightOfString("CONTACT") + 138.5,{fit:[10,10]});
      pdf.font("Text Font", 10).text(location, 46, spacings[0] + pdf.heightOfString("CONTACT") + 140,{baseline:'center'});
  
      pdf.image("images/mobile.png", 32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+144,{fit:[12,12]});
      pdf.font("Text Font", 10).text(mobile,46,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+144,{baseline:'center'});
  
      pdf.image("images/mail.png", 33, spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+148,{fit:[10,10]});
      pdf.font("Text Font", 10).text(email,47, spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+147,{baseline:'center',link:"mailto:vamsikannepalli@gmail.com"});
  
      pdf.image("images/linkedin.png", 33, spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+148,{fit:[10,10]});
      pdf.font("Text Font", 10).text(linkedIn, 47,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+148,{baseline:'center',link:linkedIn,lineBreak:true,width:144.184});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+165).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+165).stroke(white)
  
      pdf.font("Heading Font",12).text("SKILLS",16 + (170.184-(pdf.widthOfString("SKILLS")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+157);
  
      pdf.font("Text Font", 10).list(skills,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+185,{bulletRadius:1.5,baseline:'hanging',lineGap:4,width:144.184});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+425).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+425).stroke(white);
  
      pdf.font("Heading Font",12).text("AWARDS/RECOGNITIONS",16 + (170.184-(pdf.widthOfString("AWARDS/RECOGNITIONS")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+417,{width:160})
      
      pdf.font("Text Font",10).list(awards,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+435,{bulletRadius:1.5,lineGap:4,baseline:'hanging'});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+479).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+479).stroke(white);
  
      pdf.font("Heading Font",12).text('HIGHEST QUALIFICATION',16 + (170.184-(pdf.widthOfString("HIGHEST QUALIFICATION")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+469)
      
      pdf.font("Text Font",9).text(highestQual,24,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+505,{width:146.184,align:'justify',lineGap:2});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+505+74).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+505+74).stroke(white);
  
      pdf.font("Heading Font",12).text("HOBBIES",16 + (170.184-(pdf.widthOfString("HOBBIES")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+469+92);
  
      pdf.font("Text Font",10).list(hobbies,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS/RECOGNITIONS")+505+86,{bulletRadius:1.5,baseline:'hanging',lineGap:4});
  
      let pdfStream = fs.createWriteStream('CV.pdf');
      pdf.pipe(res);
      pdf.end();
      // pdfStream.on('finish',()=>{
      //   res.download('CV.pdf',{root:'.'});
      //   //res.sendFile('CV.pdf',{root:'.'});
      // })
  } catch (error) {
    console.log('Error',error);
    res.status(500).send({message:"Network Error"});
  }
});

export { generateRouter };
