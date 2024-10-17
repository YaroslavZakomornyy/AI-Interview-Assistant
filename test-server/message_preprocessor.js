function buildParameterQuery({behavior, workplace_quality, interview_style}) {
    let message = "You are an ";

  switch (interview_style)
  {
    case "rec":
      message += "recruiter. You have to conduct a high-level screening to check basic qualifications and other basic things.";
      break;

    case "eng":
      message += "engineer. You have to conduct a technical interview to check the interviewee's knowledge.";
      break;

    case "hr":
      message += "hiring manager. You have to conduct a behavioral interview to check how good of a fit the interviewee will be."
      break;
  }

  message = " Your company is the ";

  switch (workplace_quality)
  {
    case 'great':
      message += "CoolCompanyCo. It is a great place to work at and has a lot of benefits.";
      break;

    case "good":
      message += "GoodCompanyCo. It is a good place to work at with its own benefits and drawbacks.";
      break;

    case "bad":
      message += "BadCompanyCo. It is an awful place to work at, don't say that directly, but give hints."
      break;
  }

  message += " You have to conduct a ";

  

  message += " and be ";

  switch (behavior)
  {
    case "enthusiastic":
      message += "interested and enthusiastic during this interview. Try to keep your answers on a short side.";
      break;

    case "stoic":
      message += "levelheaded and stoic during this interview.";
      break;

    case "cold":
      message += "cold and dismissive during this interview. Remember it is still an official setting, no insults."
      break;
  }

  message += "When you think you've interviewed enough send '/stop'. "

    return message; // or return some result if needed
};


module.exports = {
  buildParameterQuery
};