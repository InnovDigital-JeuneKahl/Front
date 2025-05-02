"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { loginUser, registerUser } from "../api/auth"
import { toast } from "@/components/ui/use-toast"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    if (!isLogin && !acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms of use",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await loginUser(email, password)
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        })
        
        // JWT token is automatically stored in localStorage by the loginUser function
        router.push('/chat')
      } else {
        // Register
        await registerUser(email, password)
        toast({
          title: "Success",
          description: "Account created successfully. You can now log in.",
        })
        setIsLogin(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-card rounded-2xl overflow-hidden shadow-md flex flex-col md:flex-row">
        {/* Left side - Image and branding */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-background/90 z-10 flex flex-col justify-between p-8">
            <div>
              <h2 className="text-2xl font-bold text-black">AMU</h2>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">Capturing Moments,</h3>
              <h3 className="text-2xl font-bold text-black">Creating Memories</h3>
            </div>
          </div>
          <Image
            src="/placeholder.svg?height=600&width=600"
            alt="Paysage montagneux"
            className="object-cover h-full w-full"
            width={600}
            height={600}
            priority
          />
        </div>

        {/* Right side - Auth form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isLogin ? "Login to your account" : "Create an account"}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary hover:underline"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>

            <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Show/hide password"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>

              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    I accept the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      terms of use
                    </Link>
                  </label>
                </div>
              )}

              {isLogin && (
                <div>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isLogin ? "Login" : "Create account"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
