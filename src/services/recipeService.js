import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

// 食谱集合名称
const RECIPES_COLLECTION = 'recipes';
const PLANS_COLLECTION = 'weeklyPlans'; // 确保这行在文件顶部定义

// 获取所有食谱
export const getAllRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() });
    });
    return recipes;
  } catch (error) {
    console.error("获取食谱失败:", error);
    throw error;
  }
};

// 添加新食谱
export const addRecipe = async (recipe) => {
  try {
    const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipe);
    return { id: docRef.id, ...recipe };
  } catch (error) {
    console.error("添加食谱失败:", error);
    throw error;
  }
};

// 更新食谱
export const updateRecipe = async (id, recipe) => {
  try {
    const recipeRef = doc(db, RECIPES_COLLECTION, id);
    await updateDoc(recipeRef, recipe);
    return { id, ...recipe };
  } catch (error) {
    console.error("更新食谱失败:", error);
    throw error;
  }
};

// 删除食谱
export const deleteRecipe = async (id) => {
  try {
    await deleteDoc(doc(db, RECIPES_COLLECTION, id));
    return id;
  } catch (error) {
    console.error("删除食谱失败:", error);
    throw error;
  }
};

// 保存周计划
export const saveWeeklyPlan = async (userId, plan) => {
  try {
    // 检查是否已有计划
    const q = query(
      collection(db, PLANS_COLLECTION), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // 更新现有计划
      const planDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, PLANS_COLLECTION, planDoc.id), {
        plan: plan,
        updatedAt: new Date()
      });
      return planDoc.id;
    } else {
      // 创建新计划
      const docRef = await addDoc(collection(db, PLANS_COLLECTION), {
        userId: userId,
        plan: plan,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("保存周计划失败:", error);
    throw error;
  }
};

// 获取用户的周计划
export const getWeeklyPlan = async (userId) => {
  try {
    const q = query(
      collection(db, PLANS_COLLECTION), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const planDoc = querySnapshot.docs[0];
      return { id: planDoc.id, ...planDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error("获取周计划失败:", error);
    throw error;
  }
};