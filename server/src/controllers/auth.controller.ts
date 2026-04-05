import * as auth from '../services/auth.service';
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

export const register = async (req : Request, res : Response) =>{
    try {
        const { name, email, password, role } = req.body;
        const newUser = await auth.register(name, email, password, role);
        res.status(201).json(ApiResponse.success("User registered successfully", newUser));
    } catch (err : any) {
        res.status(400).json(ApiResponse.error(err.message));
    }
}


export const login = async (req: Request , res: Response) =>{
    try{
        const {email,password} = req.body;
        const result = await auth.login(email,password);
        res.status(200).json(ApiResponse.success("User login successfully",result));
    }catch(err: any){
        res.status(400).json(ApiResponse.error(err.message))
    }
}