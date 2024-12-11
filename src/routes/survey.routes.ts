import { Router } from "express";
import SurveyController from "../controllers/survey.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";
import { AppDataSource } from "../config/data-source";

const router = Router();


router.post(
  "/survey",
  authMiddleware(["SuperAdmin"]),
  SurveyController.createSurvey
);


router.get(
  "/surveys",
  authMiddleware(["SuperAdmin"]),
  SurveyController.getAllSurveys
);

router.get('/surveys/:surveyId/answers',
  authMiddleware(["SuperAdmin"]),
  SurveyController.getSurveyAnswers);



router.get(
  "/survey/:surveyId",
  authMiddleware(    [
    "SuperAdmin",
    "FranchiseAdmin",
    "LocationAdmin",
    "Teacher",
    "Parent",
    "Student",
  ],
  [
    {
      repository: AppDataSource.getRepository(Franchise),
      relationName: "franchises",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
  ]),
  SurveyController.getSurveyById
);


router.put(
  "/survey/:surveyId",
  authMiddleware(["SuperAdmin"]),
  SurveyController.editSurvey
);

router.patch(
  "/survey/self/skip",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SurveyController.skipSurveyForSelf
);


router.get(
  "/surveys/self",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SurveyController.getSurveysForSelf
);


router.post(
  "/surveys/self/submit",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SurveyController.submitSurveyForSelf
);

export default router;

