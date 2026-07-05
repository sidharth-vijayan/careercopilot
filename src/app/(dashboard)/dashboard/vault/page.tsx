"use client";

import { useEffect, useState } from "react";
import { getVaultItems, saveVaultItem, deleteVaultItem } from "@/actions/vault";
import { Button } from "@/components/ui/button";
import { Database, Plus, Trash2, Edit3, Check, Loader2, Sparkles, FolderHeart } from "lucide-react";
import { toast } from "@/lib/store/toast";

type VaultItemType = "experience" | "project" | "skill";

interface VaultItemData {
  id?: string;
  type: VaultItemType;
  title: string;
  bulletPoints: string[];
}

export default function VaultPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Current active tab in Vault view
  const [activeTab, setActiveTab] = useState<VaultItemType>("experience");
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [formType, setFormType] = useState<VaultItemType>("experience");
  const [formTitle, setFormTitle] = useState("");
  const [bullets, setBullets] = useState<string[]>([""]);

  const fetchItems = async () => {
    setLoading(true);
    const response = await getVaultItems();
    if (response.success && response.data) {
      setItems(response.data);
    } else {
      toast("Error", {
        description: response.error || "Failed to load Vault items.",
        type: "error"
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddBulletField = () => {
    setBullets([...bullets, ""]);
  };

  const handleBulletChange = (index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    setBullets(updated);
  };

  const handleRemoveBulletField = (index: number) => {
    if (bullets.length === 1) {
      setBullets([""]);
    } else {
      setBullets(bullets.filter((_, i) => i !== index));
    }
  };

  const openCreateForm = (type: VaultItemType) => {
    setFormType(type);
    setFormTitle("");
    setBullets([""]);
    setEditingId(undefined);
    setShowForm(true);
  };

  const openEditForm = (item: any) => {
    setFormType(item.type);
    setFormTitle(item.title);
    setBullets(Array.isArray(item.bulletPoints) ? [...item.bulletPoints] : [""]);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast("Validation Error", { description: "Title/Heading is required.", type: "error" });
      return;
    }

    setSaving(true);
    const response = await saveVaultItem(editingId, formType, formTitle, bullets);
    if (response.success) {
      toast("Success", { description: "Vault item saved successfully!", type: "success" });
      setShowForm(false);
      fetchItems();
    } else {
      toast("Error", { description: response.error || "Failed to save item.", type: "error" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Vault item?")) return;
    
    const response = await deleteVaultItem(id);
    if (response.success) {
      toast("Deleted", { description: "Item removed from your Vault.", type: "success" });
      fetchItems();
    } else {
      toast("Error", { description: response.error || "Failed to delete item.", type: "error" });
    }
  };

  // Prefill dynamic SaaS demo experiences
  const loadDemoData = async () => {
    setSaving(true);
    try {
      const demoItems: VaultItemData[] = [
        {
          type: "experience",
          title: "Senior Full Stack Engineer at TechCorp Solutions",
          bulletPoints: [
            "Led a team of 4 engineers to rebuild a legacy analytics dashboard in React & TypeScript, resulting in a 40% reduction in page load time and a 25% increase in user engagement.",
            "Architected and built a high-throughput GraphQL API gateway using Node.js and Express, consolidating 15+ microservices and serving 5M+ daily requests.",
            "Spearheaded database optimization strategies for PostgreSQL, reducing slow query execution by 35% through proper indexing and caching.",
            "Developed responsive user interfaces using React, Redux, and TailwindCSS for a highly secure B2B SaaS platform."
          ]
        },
        {
          type: "experience",
          title: "Full Stack Developer at InnovateLabs",
          bulletPoints: [
            "Designed and built scalable backend REST APIs using Node.js and Express, supporting over 100k monthly active users.",
            "Maintained CI/CD pipelines and automated deployments to AWS EC2 instances, reducing release cycles by 20%.",
            "Conducted regular code reviews and introduced unit testing guidelines, boosting overall code coverage to 80%."
          ]
        },
        {
          type: "project",
          title: "E-Commerce Microservices Infrastructure",
          bulletPoints: [
            "Architected a scalable microservices structure utilizing Docker containerization which enhanced overall service reliability to 99.95%.",
            "Implemented an API gateway caching layer with Redis, cutting database request latencies by 60%."
          ]
        },
        {
          type: "skill",
          title: "Languages & Core",
          bulletPoints: ["TypeScript", "JavaScript (ES6+)", "PostgreSQL", "SQL", "HTML5", "CSS3"]
        },
        {
          type: "skill",
          title: "Frameworks & Dev",
          bulletPoints: ["React.js", "Node.js", "Express.js", "TailwindCSS", "Docker", "AWS (S3/EC2/ECR)"]
        }
      ];

      for (const demo of demoItems) {
        await saveVaultItem(undefined, demo.type, demo.title, demo.bulletPoints);
      }

      toast("Demo Vault Loaded!", { description: "Loaded 5 realistic experiences, projects, and skills.", type: "success" });
      fetchItems();
    } catch (err) {
      toast("Error", { description: "Failed to load demo data.", type: "error" });
    }
    setSaving(false);
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Database className="h-8 w-8 text-primary" />
            The Experience Vault 🏦
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">
            Store all your past positions, major projects, and tech skills. When tailoring, our AI instantly pulls and rewrites bullet points from here.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {items.length === 0 && (
            <Button variant="outline" onClick={loadDemoData} disabled={saving} className="border-dashed flex items-center gap-1.5 h-11 px-4 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              Load B2B Demo Vault
            </Button>
          )}
          <Button onClick={() => openCreateForm(activeTab)} className="h-11 px-5 text-sm font-bold flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add to {activeTab === "experience" ? "Experiences" : activeTab === "project" ? "Projects" : "Skills"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b space-x-6 pb-0.5">
        {(["experience", "project", "skill"] as VaultItemType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`pb-3 text-base font-bold transition-all border-b-2 px-1 capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "experience" ? "Work Experiences" : tab === "project" ? "Projects" : "Tech Skills"}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle Columns: Items List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed p-16 text-center bg-card">
              <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-70" />
              <h3 className="text-lg font-bold text-foreground">Your Vault is empty!</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                Add your historic credentials, or click "Load B2B Demo Vault" to prefill realistic B2B SaaS developer details.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button size="sm" variant="outline" onClick={loadDemoData} disabled={saving}>
                  Load B2B Demo Vault
                </Button>
                <Button size="sm" onClick={() => openCreateForm(activeTab)}>
                  Add New Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 border-b pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-extrabold text-foreground">{item.title}</h4>
                      <span className="inline-block mt-1 text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => openEditForm(item)}>
                        <Edit3 className="h-4.5 w-4.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>

                  {item.type === "skill" ? (
                    <div className="flex flex-wrap gap-2">
                      {(item.bulletPoints as string[]).map((skill, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-primary/5 border px-3 py-1 text-xs font-bold text-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {(item.bulletPoints as string[]).map((bullet, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-2 shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Form Editor Sidebar */}
        <div className="lg:col-span-1">
          {showForm ? (
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6 sticky top-28 animate-in slide-in-from-right duration-200">
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-foreground">
                  {editingId ? "Edit Vault Item" : `Add to ${activeTab === "experience" ? "Experiences" : activeTab === "project" ? "Projects" : "Skills"}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in your achievements. Use bullet points to highlight metrics.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
                    {formType === "skill" ? "Skill Category Title" : formType === "project" ? "Project Name" : "Job Title & Company"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={formType === "skill" ? "e.g. Languages & Frameworks" : formType === "project" ? "e.g. Personal Portfolio Website" : "e.g. Full Stack Developer at Google"}
                    className="w-full rounded-md border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Bullets/Skill Lists */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
                      {formType === "skill" ? "Individual Skills (Tags)" : "Bullet Achievements"}
                    </label>
                    <Button type="button" variant="ghost" className="h-7 px-2 text-xs font-bold text-primary flex items-center gap-1" onClick={handleAddBulletField}>
                      <Plus className="h-3 w-3" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          placeholder={formType === "skill" ? "e.g. TypeScript" : "e.g. Achieved 25% query latency drop by implementing Redis caching layers."}
                          className="flex-1 min-h-[50px] rounded-md border bg-transparent px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
                          value={bullet}
                          onChange={(e) => handleBulletChange(idx, e.target.value)}
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-1" onClick={() => handleRemoveBulletField(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex gap-3 border-t pt-4">
                  <Button type="button" variant="outline" className="flex-1 text-sm font-semibold" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1 text-sm font-bold">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Check className="h-4 w-4 mr-1.5" />
                    )}
                    Save to Vault
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-6 text-center space-y-4 py-10 sticky top-28">
              <Database className="h-10 w-10 text-primary mx-auto opacity-70 animate-pulse" />
              <h4 className="text-base font-bold text-foreground">Centralized Credentials</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                No need to keep 20 versions of your resume on your hard drive. Write it all here once, and optimize instantly for every single application.
              </p>
              <Button size="sm" variant="outline" onClick={() => openCreateForm(activeTab)} className="w-full mt-2 font-semibold">
                Add Vault Item
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
