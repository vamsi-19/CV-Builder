import express from "express";
import PDF from "pdfkit";
import cors from "cors";
import fs from "fs";
import {colors} from "../styles/colors.js";
import {stringValidator,arrayValidator,objectValidator} from "../utils.js";

const generateRouter = express.Router();
const {black,white,green} = colors;
const margins = { top: 12, bottom: 12, left: 30, right: 30 };
const star = "•";
const headings = ["CAREER SUMMARY", "WORK EXPERIENCE"];
let imageMimetype;

generateRouter.use(cors({
  origin:['http://192.168.0.103:3001','http://localhost:3001'],
  methods: ['GET','POST']
}))

generateRouter.post("/upload", (req,res) => {
  let uploadErr = new Error();
  try {
  const files = req.files;
  const {image} = files;
  if(!image && !(image.mimetype==='image/jpeg' || image.mimetype==='image/jpg') || image.mimetype==='image/png') {
    uploadErr.message = '400';
    throw new Error();
  }
  imageMimetype = image.mimetype.split('/')[1];
  fs.writeFile(`images/Passport.${imageMimetype}`,image.data,{},(writeError)=>{
    if(!writeError) {
      res.status(200).send({message:'File uploaded'})
    }
    else {
      uploadErr.message = '500';
      throw new Error();
    }
  })
  } catch (error) {
    if(uploadErr.message === '400') res.status(400).send({message:"Bad request"});
    else res.status(500).send({message:"Network Error"});
  }
})

generateRouter.post("/", (req, res) => {
  let err = new Error();
  try {
   const {careerSummary,highestAcademicQualification,hobbies,skills,workExperience:content,details,awards,personalProject} = req.body;
   const {university,qualification,stream,gpa,from,to} = highestAcademicQualification
   const {mobile,name,email,linkedIn,location} = details;
   const {name:projName,about,framework,repository,postScript} = personalProject;
   if(!(stringValidator(careerSummary) && objectValidator(highestAcademicQualification) && objectValidator(hobbies) && arrayValidator(skills) && arrayValidator(content) && arrayValidator(awards) && objectValidator(details) && objectValidator(personalProject) && stringValidator(university) && stringValidator(qualification) && stringValidator(stream) && stringValidator(gpa) && stringValidator(from) && stringValidator(to) && arrayValidator(hobbies) && stringValidator(projName) &&stringValidator(framework) &&stringValidator(repository) && stringValidator(postScript) && stringValidator(about) && Math.floor(parseInt(to)) > Math.floor(parseInt(from)))) {
    err.message = '400';
    throw new Error();
   }
   else {
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
  
    pdf.font("Text Font", 14).text(headings[0], 194.184, spacings[0], { fill: black });
  
    pdf.font("Text Font", 10).text(careerSummary, 194.184, spacings[1], { align: "justify" });
  
    spacings.push(spacings[1] + 4 + pdf.heightOfString(careerSummary));
  
    pdf.moveTo(194.184, spacings[2]).lineTo(579.28, spacings[2]).stroke();
  
    spacings.push(spacings[2] + 4);

    pdf.font("Text Font", 14).text(headings[1], 194.184, spacings[3], { fill: black });

    spacings.push(spacings[3] + pdf.heightOfString(headings[1]));
  
    content.forEach((item, i) => {
      pdf.font("Heading Font", 12).text(item.company, 194.184, spacings[spacings.length - 1], {
          fill: black,
          continued: true,
        })
        .font("Text Font", 12)
        .text(item.location, 194.184, spacings[spacings.length - 1], {
          align: "right",
          fill: black,
        });
      spacings.push(
        spacings[spacings.length - 1] + pdf.heightOfString(item.company)
      );
  
      item["roles"].forEach((a, b) => {
        pdf
          .font("Heading Font", 12)
          .text(a.name, 194.184, spacings[spacings.length - 1], {
            fill: black,
            continued: true,
          })
          .font("Text Font", 12)
          .text(a.period, 194.184, spacings[spacings.length - 1], {
            fill: black,
            align: "right",
          });
        spacings.push(
          spacings[spacings.length - 1] + pdf.heightOfString(a.name) + 4
        );
  
        a["description"].forEach((p, q) => {
          let { text, link } = p;
          let linkObj =
            link.length > 0
              ? { link, align: "justify", underline: true }
              : undefined;
          pdf.text(star, 194.184, spacings[spacings.length - 1], {
            baseline: "hanging",
          });
          pdf
            .font("Text Font", 10)
            .text(
              `${text}`,
              194.184 + pdf.widthOfString(star) + 4,
              spacings[spacings.length - 1],
              {
                align: "justify",
                continued: true,
                baseline: "hanging",
              }
            )
            .text(`\n${link}`, linkObj);
          spacings.push(
            spacings[spacings.length - 1] +
              pdf.heightOfString(a.description[q].text + `${a.description[q].link ? '\n' : ''}${a.description[q].link}`) +
              4
          );
        });
      });
    });
    pdf
      .moveTo(194.184, spacings[spacings.length - 1])
      .lineTo(579.28, spacings[spacings.length - 1])
      .stroke();
    
      pdf.font('Heading Font',10).text(personalProject.name,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8)
      pdf.font('Text Font',10).text(`About : ${personalProject.about}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2)
      pdf.font('Text Font',10).text(`Framework : ${personalProject.framework}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2+pdf.heightOfString(`About : ${personalProject.about}`)+2)
      pdf.font('Text Font',10).text(`Github Repository : `,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2,{continued:true}).text(`${personalProject.repository}`,{link:`${personalProject.repository}`,underline:true})

      pdf
      .moveTo(194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+6+pdf.heightOfString(`PS : ${personalProject.postScript}`))
      .lineTo(579.28, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+6+pdf.heightOfString(`PS : ${personalProject.postScript}`))
      .stroke();

      pdf.font('Text Font',14).text('HIGHEST ACADEMIC QUALIFICATION',194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `))
      pdf.font('Text Font',10).text(`University : ${highestAcademicQualification.university}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('CV-Builder')+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+pdf.heightOfString(`PS : ${personalProject.postScript}`)+14+pdf.heightOfString('HIGHEST ACADEMIC QUALIFICATION')+2)
      pdf.font('Text Font',10).text(`Qualification : ${highestAcademicQualification.qualification}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('CV-Builder')+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+pdf.heightOfString(`PS : ${personalProject.postScript}`)+16+pdf.heightOfString('HIGHEST ACADEMIC QUALIFICATION')+pdf.heightOfString(`University : ${highestAcademicQualification.university}`)+2)
      pdf.font('Text Font',10).text(`Stream : ${highestAcademicQualification.stream}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('CV-Builder')+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+pdf.heightOfString(`PS : ${personalProject.postScript}`)+18+pdf.heightOfString('HIGHEST ACADEMIC QUALIFICATION')+pdf.heightOfString(`University : ${highestAcademicQualification.university}`)+pdf.heightOfString(`Qualification : ${highestAcademicQualification.qualification}`)+2)
      pdf.font('Text Font',10).text(`GPA : ${highestAcademicQualification.gpa}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('CV-Builder')+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+pdf.heightOfString(`PS : ${personalProject.postScript}`)+18+pdf.heightOfString('HIGHEST ACADEMIC QUALIFICATION')+pdf.heightOfString(`University : ${highestAcademicQualification.university}`)+pdf.heightOfString(`Qualification : ${highestAcademicQualification.qualification}`)+pdf.heightOfString(`Stream : ${highestAcademicQualification.stream}`)+4)
      pdf.font('Text Font',10).text(`Duration : ${Math.floor(parseInt(highestAcademicQualification.from))} - ${Math.floor(parseInt(highestAcademicQualification.to))}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString('CV-Builder')+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+pdf.heightOfString(`PS : ${personalProject.postScript}`)+18+pdf.heightOfString('HIGHEST ACADEMIC QUALIFICATION')+pdf.heightOfString('GITAM University')+pdf.heightOfString(`Qualification : ${highestAcademicQualification.qualification}`)+pdf.heightOfString(`GPA : ${highestAcademicQualification.gpa}`)+pdf.heightOfString(`Stream : ${highestAcademicQualification.stream}`)+6)

      pdf.font('Heading Font',10).text(`PS : ${personalProject.postScript}`,194.184, spacings[spacings.length - 1]+4+pdf.heightOfString('PERSONAL PROJECTS')+8+pdf.heightOfString(personalProject.name)+2+pdf.heightOfString(`About : ${personalProject.about}`)+2+pdf.heightOfString(`Framework : ${personalProject.framework}`)+2+pdf.heightOfString(`Github Repository : `)+2);
      pdf.font('Text Font',14).text('PERSONAL PROJECTS',194.184, spacings[spacings.length - 1]+4)

    pdf.rect(16, spacings[0], 170.184, 777.89).fill(green);
    pdf.image(`images/Passport.${imageMimetype}`, 16, spacings[0] + 12, {
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
  
      pdf.font("Heading Font",12).text("SKILLS / TOOLS",16 + (170.184-(pdf.widthOfString("SKILLS / TOOLS")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+157);
  
      pdf.font("Text Font", 10).list(skills,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+185,{bulletRadius:1.5,baseline:'hanging',lineGap:4,width:144.184});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+425).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+425).stroke(white);
  
      pdf.font("Heading Font",12).text("AWARDS / APPRAISALS",16 + (170.184-(pdf.widthOfString("AWARDS / APPRAISALS")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+417,{width:160})
      
      pdf.font("Text Font",10).list(awards,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS / APPRAISALS")+435,{bulletRadius:1.5,lineGap:4,baseline:'hanging'});
  
      pdf.moveTo(18,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS / APPRAISALS")+479).lineTo(184.184,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS / APPRAISALS")+479).stroke(white);
  
      pdf.font("Heading Font",12).text('HOBBIES',16 + (170.184-(pdf.widthOfString("HOBBIES")))/2,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS / APPRAISALS")+469)
      
      pdf.font("Text Font",10).list(hobbies,32,spacings[0]+pdf.heightOfString("CONTACT")+pdf.heightOfString(location)+pdf.heightOfString(mobile)+pdf.heightOfString(email)+pdf.heightOfString(linkedIn)+pdf.heightOfString("AWARDS / APPRAISALS")+505-4,{bulletRadius:1.5,baseline:'hanging',lineGap:4});
  
      let pdfStream = fs.createWriteStream('CV.pdf');
      pdf.pipe(pdfStream);
      pdf.end();
      pdfStream.on('finish',()=>{
        res.download('CV.pdf',{root:'.'});
      })
  }
  } catch (error) {
    if(err.message === '400') res.status(400).send({message:"Bad request"});
    else res.status(500).send({message:"Network Error"});
  }
});

export { generateRouter };
