import e, { Request, Response } from "express";
import * as jobServices from "../services/job.service";
import ApiResponse from "../utils/ApiResponse";

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as string;
    const {
      company_id,
      title,
      description,
      location,
      type,
      category,
      salary_min,
      salary_max,
    } = req?.body;
    if (!userId) throw new Error("user not found");
    const newJob = await jobServices.createJob(
      company_id,
      title,
      description,
      location,
      type,
      category,
      salary_min,
      salary_max,
      userId,
    );
    res
      .status(201)
      .json(ApiResponse.success("Job created successfully", newJob));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

const getFilters = (query: any) => {
  const filters: any = {};
  if (query.category) filters.category = query.category;
    if (query.type) filters.type = query.type;
    if (query.salary_min) filters.salary_min = Number(query.salary_min);
    return filters;
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const filters = getFilters(req.query);
    const getAll = await jobServices.getAllJobs(filters);
    res.status(200).json(ApiResponse.success("Response successfull", getAll));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error("job not found"));
  }
};

export const getOne = async (req: Request ,res: Response) =>{
    try{
        const id = req?.params?.id as string;
        if(!id) throw new Error("Id isn't found");
        const getJobById = await jobServices.getJobById(id);
        res.status(200).json(ApiResponse.success("Job found by id successfully",getJobById));
    }catch(error){
        res.status(400).json(ApiResponse.error("job didn't find by id"));
    }
}

export const update = async (req: Request , res: Response) =>{
    try{
        const id = req?.params?.id as string;
        const userId = req?.user?.id as string
        const {title,description,location,type,category,salary_min,salary_max} = req?.body;
        const update = await jobServices.updateJob(id,userId,{title,description,location,type,category,salary_min,salary_max});
        res.status(200).json(ApiResponse.success("Job updated successfully",update));
    }catch(error: any){
        res.status(400).json(ApiResponse.error(error.message))
    }
}

export const remove = async (req:Request,res: Response) =>{
    try{
        const id = req?.params?.id as string
        const userId = req?.user?.id as string
        const remove = await jobServices.deleteJob(id,userId)
        res.status(200).json(ApiResponse.success("Job removed",remove));
    }catch(error:any){
        res.status(400).json(ApiResponse.error(error.message))
    }
}

export const submit = async (req: Request , res: Response) => {
    try{
        const id = req?.params?.id as string
        const userId = req?.user?.id as string
        const submit = await jobServices.submitJobForReview(id,userId);
        res.status(200).json(ApiResponse.success("job submited successfully",submit));
    }catch(error: any){
        res.status(400).json(ApiResponse.error(error.message))
    }
}

export const approve = async (req: Request , res: Response) =>{
    try{
        const id = req?.params?.id as string;
        const admin = await jobServices.approveJob(id);
        res.status(200).json(ApiResponse.success("joba approved",admin))
    }catch(error:any){
        res.status(400).json(ApiResponse.error(error.message))
    }
}

